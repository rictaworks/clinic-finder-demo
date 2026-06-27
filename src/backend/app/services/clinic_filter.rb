class ClinicFilter
  MAX_SCORE = 100
  DEPT_SCORE_FIRST = 40
  DEPT_SCORE_SECOND = 25
  DEPT_SCORE_OTHER = 10
  SLOT_SCORE_MAX = 30
  RATING_MULTIPLIER = 6

  def self.filter(departments, area_id, has_slot, now = Time.current)
    Rails.logger.info("[ClinicFilter] Filtering: depts=#{departments.map(&:id)}, area=#{area_id}, has_slot=#{has_slot}")
    date_from = now.to_date
    date_to = date_from + 6.days

    scope = Clinic.includes(:clinic_departments, :available_slots)
    scope = scope.where(area_id: area_id) if area_id.present?

    clinics = scope.all
    slot_counts = AvailableSlot.where(
      clinic_id: clinics.map(&:id),
      slot_date: date_from..date_to,
      status: 'open'
    ).group(:clinic_id).count

    max_slots = slot_counts.values.max || 1

    scored = clinics.map do |clinic|
      next if has_slot && slot_counts.fetch(clinic.id, 0) == 0
      score = calc_score(clinic, departments, slot_counts.fetch(clinic.id, 0), max_slots)
      { clinic: clinic, score: score, available_slots_count: slot_counts.fetch(clinic.id, 0) }
    end.compact

    result = scored.sort_by { |s| -s[:score] }
    Rails.logger.info("[ClinicFilter] Returned #{result.size} clinics")
    result
  rescue => e
    Rails.logger.error("[ClinicFilter] filter error: #{e.message}")
    []
  end

  private

  def self.calc_score(clinic, departments, slot_count, max_slots)
    dept_ids = clinic.clinic_departments.map(&:department_id)
    dept_s = dept_score(departments, dept_ids)
    slot_s = slot_score(slot_count, max_slots)
    rating_s = (clinic.rating.to_f * RATING_MULTIPLIER).round
    total = dept_s + slot_s + rating_s
    Rails.logger.debug("[ClinicFilter] Clinic #{clinic.name}: dept=#{dept_s}, slot=#{slot_s}, rating=#{rating_s}, total=#{total}")
    total
  end

  def self.dept_score(departments, clinic_dept_ids)
    departments.each_with_index do |dept, index|
      next unless clinic_dept_ids.include?(dept.id)
      return case index
             when 0 then DEPT_SCORE_FIRST
             when 1 then DEPT_SCORE_SECOND
             else DEPT_SCORE_OTHER
             end
    end
    0
  end

  def self.slot_score(slot_count, max_slots)
    return 0 if max_slots.zero?
    ((slot_count.to_f / max_slots) * SLOT_SCORE_MAX).round
  end
end
