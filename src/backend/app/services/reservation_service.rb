class ReservationService
  def self.reserve(clinic_id:, slot_id:, age_group:, symptom_note:, session_id:)
    Rails.logger.info("[ReservationService] reserve: clinic=#{clinic_id}, slot=#{slot_id}, session=#{session_id}")
    reservation = nil
    ActiveRecord::Base.transaction do
      slot = AvailableSlot.lock.find(slot_id)
      raise ActiveRecord::RecordNotFound, "Slot not found" unless slot
      raise StandardError, "Slot not available" unless slot.status == 'open'
      raise StandardError, "Slot does not belong to clinic" unless slot.clinic_id == clinic_id.to_i

      existing = Reservation.joins(:available_slot)
                             .where(session_id: session_id, clinic_id: clinic_id, status: 'pending')
                             .where(available_slots: { slot_date: slot.slot_date })
                             .first
      raise StandardError, "Already reserved for this clinic on this date" if existing

      slot.update!(status: 'reserved')
      reservation = Reservation.create!(
        session_id: session_id,
        clinic_id: clinic_id,
        slot_id: slot_id,
        age_group: age_group,
        symptom_note: symptom_note,
        status: 'pending',
        reserved_at: Time.current
      )
    end
    Rails.logger.info("[ReservationService] Created reservation: #{reservation.id}")
    reservation
  rescue => e
    Rails.logger.error("[ReservationService] reserve error: #{e.message}")
    raise
  end

  def self.get(reservation_id, session_id)
    reservation = Reservation.find(reservation_id)
    check_ownership!(reservation, session_id)
    reservation
  rescue ActiveRecord::RecordNotFound
    raise
  rescue => e
    Rails.logger.error("[ReservationService] get error: #{e.message}")
    raise
  end

  def self.cancel(reservation_id, session_id)
    Rails.logger.info("[ReservationService] cancel: reservation=#{reservation_id}, session=#{session_id}")
    reservation = Reservation.find(reservation_id)
    check_ownership!(reservation, session_id)
    raise StandardError, "Already cancelled" if reservation.status == 'cancelled'
    ActiveRecord::Base.transaction do
      reservation.update!(status: 'cancelled')
      AvailableSlot.find(reservation.slot_id).update!(status: 'open')
    end
    Rails.logger.info("[ReservationService] Cancelled reservation: #{reservation.id}")
    reservation
  rescue => e
    Rails.logger.error("[ReservationService] cancel error: #{e.message}")
    raise
  end

  private

  def self.check_ownership!(reservation, session_id)
    unless reservation.session_id == session_id
      raise SecurityError, "Not authorized to access this reservation"
    end
  end
end
