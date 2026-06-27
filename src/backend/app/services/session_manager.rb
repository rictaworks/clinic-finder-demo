class SessionManager
  SESSION_EXPIRY_HOURS = 24

  def self.manage(request)
    session_id = request.cookies['clinic_session_id']
    session = validate_session(session_id) if session_id.present?
    session ||= create_session
    session.session_id
  end

  def self.find(session_id)
    validate_session(session_id)
  end

  private

  def self.generate_session_id
    SecureRandom.uuid
  end

  def self.validate_session(id)
    session = Session.find_by(session_id: id)
    return nil unless session
    return nil if session.expires_at < Time.current
    session.update!(expires_at: SESSION_EXPIRY_HOURS.hours.from_now)
    session
  rescue => e
    Rails.logger.error("[SessionManager] validate_session error: #{e.message}")
    nil
  end

  def self.create_session
    session = Session.create!(
      session_id: generate_session_id,
      expires_at: SESSION_EXPIRY_HOURS.hours.from_now
    )
    Rails.logger.info("[SessionManager] Created new session: #{session.session_id}")
    session
  rescue => e
    Rails.logger.error("[SessionManager] create_session error: #{e.message}")
    raise
  end
end
