module Api
  class SearchController < ApplicationController
    def search
      symptom_text = params[:symptom].to_s.strip
      area_text = params[:area].to_s.strip
      has_slot = ActiveModel::Type::Boolean.new.cast(params[:has_slot])

      Rails.logger.info("[SearchController] search: symptom=#{symptom_text}, area=#{area_text}, has_slot=#{has_slot}")

      departments = SymptomMapper.map(symptom_text)
      area_id = LocationResolver.resolve(area_text)
      results = ClinicFilter.filter(departments, area_id, has_slot)

      render json: {
        departments: departments.map { |d| { id: d.id, name: d.name } },
        area_id: area_id,
        clinics: results.map { |r| clinic_summary(r) }
      }
    end

    private

    def clinic_summary(result)
      clinic = result[:clinic]
      {
        clinic: {
          id: clinic.id,
          name: clinic.name,
          address: clinic.address,
          phone_display: clinic.phone_display,
          rating: clinic.rating,
          open_time: clinic.open_time,
          close_time: clinic.close_time,
          area: {
            id: clinic.area.id,
            name: clinic.area.name,
            en_name: clinic.area.en_name
          },
          departments: clinic.departments.map { |d| { id: d.id, name: d.name } }
        },
        score: result[:score],
        available_slots_count: result[:available_slots_count]
      }
    end
  end
end
