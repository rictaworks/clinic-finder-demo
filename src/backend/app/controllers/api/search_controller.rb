module Api
  class SearchController < ApplicationController
    def search
      symptom_text = params[:symptom].to_s.strip
      location_text = params[:location].to_s.strip
      has_slot = ActiveModel::Type::Boolean.new.cast(params[:has_slot])

      Rails.logger.info("[SearchController] search: symptom=#{symptom_text}, location=#{location_text}, has_slot=#{has_slot}")

      departments = SymptomMapper.map(symptom_text)
      area_id = LocationResolver.resolve(location_text)
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
        id: clinic.id,
        name: clinic.name,
        address: clinic.address,
        rating: clinic.rating,
        open_time: clinic.open_time,
        close_time: clinic.close_time,
        area_id: clinic.area_id,
        available_slots_count: result[:available_slots_count],
        score: result[:score],
        departments: clinic.departments.map { |d| { id: d.id, name: d.name } }
      }
    end
  end
end
