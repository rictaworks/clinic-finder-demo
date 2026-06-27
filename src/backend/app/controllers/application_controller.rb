class ApplicationController < ActionController::API
  include ActionController::Cookies

  # rescue_from is evaluated in reverse order (LIFO): most specific handlers must be defined LAST
  rescue_from StandardError, with: :internal_error
  rescue_from SecurityError, with: :forbidden
  rescue_from ActiveRecord::RecordInvalid, with: :record_invalid
  rescue_from ActiveRecord::RecordNotFound, with: :record_not_found

  private

  def current_session_id
    @current_session_id ||= SessionManager.manage(request)
  end

  def record_not_found(e)
    Rails.logger.warn("[Controller] RecordNotFound: #{e.message}")
    render json: { error: 'Not found', message: e.message }, status: :not_found
  end

  def record_invalid(e)
    Rails.logger.warn("[Controller] RecordInvalid: #{e.message}")
    render json: { error: 'Validation failed', message: e.message }, status: :unprocessable_entity
  end

  def forbidden(e)
    Rails.logger.warn("[Controller] Forbidden: #{e.message}")
    render json: { error: 'Forbidden', message: e.message }, status: :forbidden
  end

  def internal_error(e)
    Rails.logger.error("[Controller] InternalError: #{e.class} - #{e.message}\n#{e.backtrace&.first(5)&.join("\n")}")
    render json: { error: 'Internal server error' }, status: :internal_server_error
  end
end
