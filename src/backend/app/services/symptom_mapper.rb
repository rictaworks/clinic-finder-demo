class SymptomMapper
  def self.map(text)
    return [] if text.blank?
    normalized_text = normalize(text)
    Rails.logger.info("[SymptomMapper] Mapping text: #{normalized_text}")
    matching_symptoms = Symptom.where("normalized LIKE ?", "%#{normalized_text}%")
                               .order(:priority)
    if matching_symptoms.empty?
      words = normalized_text.split(/[\s、,]+/)
      matching_symptoms = Symptom.where(
        words.map { "normalized LIKE ?" }.join(" OR "),
        *words.map { |w| "%#{w}%" }
      ).order(:priority)
    end
    dept_ids = matching_symptoms.map(&:department_id).uniq
    departments = Department.where(id: dept_ids)
    ranked = dept_ids.map { |id| departments.find { |d| d.id == id } }.compact
    Rails.logger.info("[SymptomMapper] Matched departments: #{ranked.map(&:name)}")
    ranked
  rescue => e
    Rails.logger.error("[SymptomMapper] map error: #{e.message}")
    []
  end

  private

  def self.normalize(text)
    text.to_s
        .unicode_normalize(:nfkc)
        .downcase
        .gsub(/[！-～]/) { |c| (c.ord - 0xFEE0).chr }
        .strip
  end
end
