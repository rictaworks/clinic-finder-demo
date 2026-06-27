class HoneypotGuard
  MIN_INTERVAL_SECONDS = 2

  def self.check(form_data, submitted_at_timestamp)
    honeypot = form_data[:_hp] || form_data['_hp']
    if honeypot.present?
      Rails.logger.warn("[HoneypotGuard] Bot detected: honeypot field filled")
      return false
    end

    unless interval_ok?(submitted_at_timestamp)
      Rails.logger.warn("[HoneypotGuard] Bot detected: submission too fast")
      return false
    end

    true
  rescue => e
    Rails.logger.error("[HoneypotGuard] check error: #{e.message}")
    false
  end

  private

  def self.interval_ok?(timestamp)
    return true if timestamp.blank?
    submitted_at = timestamp.to_f / 1000.0
    elapsed = Time.current.to_f - submitted_at
    elapsed >= MIN_INTERVAL_SECONDS
  end
end
