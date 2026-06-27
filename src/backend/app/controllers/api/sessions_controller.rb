module Api
  class SessionsController < ApplicationController
    def create
      session_id = current_session_id
      response.set_cookie(
        'clinic_session_id',
        value: session_id,
        httponly: true,
        same_site: :none,
        secure: true,
        expires: 24.hours.from_now
      )
      render json: { session_id: session_id }, status: :created
    end
  end
end
