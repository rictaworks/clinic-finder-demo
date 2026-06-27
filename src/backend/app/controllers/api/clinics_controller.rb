module Api
  class ClinicsController < ApplicationController
    def show
      clinic = Clinic.includes(:area, :departments, :available_slots).find(params[:id])
      slots = clinic.available_slots
                    .where(slot_date: Date.current..(Date.current + 6.days))
                    .order(:slot_date, :slot_time)

      render json: {
        id: clinic.id,
        name: clinic.name,
        address: clinic.address,
        phone_display: clinic.phone_display,
        rating: clinic.rating,
        open_time: clinic.open_time,
        close_time: clinic.close_time,
        area: { id: clinic.area.id, name: clinic.area.name },
        departments: clinic.departments.map { |d| { id: d.id, name: d.name } },
        available_slots: slots.map { |s|
          {
            id: s.id,
            slot_date: s.slot_date,
            slot_time: s.slot_time,
            status: s.status,
            capacity: s.capacity
          }
        }
      }
    end
  end
end
