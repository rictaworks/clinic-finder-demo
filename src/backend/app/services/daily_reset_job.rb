class DailyResetJob
  def self.run(now_utc = Time.now.utc)
    Rails.logger.info("[DailyResetJob] Starting daily reset at #{now_utc}")
    return unless is_reset_time?(now_utc)
    return if already_run_today?(now_utc.to_date)

    ActiveRecord::Base.transaction do
      delete_reservations
      delete_sessions
      reset_slots
      log_reset(now_utc.to_date, now_utc)
    end
    Rails.logger.info("[DailyResetJob] Daily reset completed")
  rescue => e
    Rails.logger.error("[DailyResetJob] run error: #{e.message}")
    raise
  end

  private

  def self.is_reset_time?(now_utc)
    now_utc.hour == 18
  end

  def self.already_run_today?(date)
    ResetLog.where(reset_date: date).exists?
  end

  def self.delete_reservations
    count = Reservation.delete_all
    Rails.logger.info("[DailyResetJob] Deleted #{count} reservations")
  end

  def self.delete_sessions
    count = Session.delete_all
    Rails.logger.info("[DailyResetJob] Deleted #{count} sessions")
  end

  def self.reset_slots
    count = AvailableSlot.update_all(status: 'open', capacity: 1)
    Rails.logger.info("[DailyResetJob] Reset #{count} slots")
  end

  def self.log_reset(date, executed_at)
    ResetLog.create!(reset_date: date, executed_at: executed_at)
    Rails.logger.info("[DailyResetJob] Logged reset for #{date}")
  end
end
