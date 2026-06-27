module Api
  class ReservationsController < ApplicationController
    def create
      unless HoneypotGuard.check(params.to_unsafe_h, params[:submitted_at])
        render json: { error: 'Bad request' }, status: :bad_request
        return
      end

      reservation = ReservationService.reserve(
        clinic_id: params[:clinic_id],
        slot_id: params[:slot_id],
        age_group: params[:age_group],
        symptom_note: params[:symptom_note],
        session_id: current_session_id
      )

      render json: reservation_json(reservation), status: :created
    rescue StandardError => e
      render json: { error: e.message }, status: :unprocessable_entity
    end

    def show
      reservation = ReservationService.get(params[:id], current_session_id)
      render json: reservation_json(reservation)
    end

    def destroy
      reservation = ReservationService.cancel(params[:id], current_session_id)
      render json: reservation_json(reservation)
    end

    private

    def reservation_json(reservation)
      slot = AvailableSlot.find(reservation.slot_id)
      clinic = Clinic.includes(:area, :departments).find(reservation.clinic_id)
      {
        id: reservation.id,
        clinic: {
          id: clinic.id,
          name: clinic.name,
          address: clinic.address,
          phone_display: clinic.phone_display,
          rating: clinic.rating,
          open_time: clinic.open_time,
          close_time: clinic.close_time,
          area: { id: clinic.area.id, name: clinic.area.name, en_name: clinic.area.en_name },
          departments: clinic.departments.map { |d| { id: d.id, name: d.name } }
        },
        slot: {
          id: slot.id,
          slot_date: slot.slot_date,
          slot_time: slot.slot_time,
          status: slot.status
        },
        age_group: reservation.age_group,
        symptom_note: reservation.symptom_note,
        status: reservation.status,
        reserved_at: reservation.reserved_at
      }
    end
  end
end
