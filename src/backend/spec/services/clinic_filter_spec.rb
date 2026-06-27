require 'rails_helper'

RSpec.describe ClinicFilter do
  describe '.filter' do
    let(:area) { create(:area) }
    let(:dept) { create(:department) }
    let!(:clinic) do
      c = create(:clinic, area: area, rating: 4.0)
      create(:clinic_department, clinic: c, department: dept)
      create(:available_slot, clinic: c, slot_date: Date.current, status: 'open')
      c
    end

    it 'returns array of scored clinics' do
      result = ClinicFilter.filter([dept], area.id, false)
      expect(result).to be_an(Array)
      expect(result.first[:clinic]).to eq(clinic)
      expect(result.first[:score]).to be_positive
    end

    it 'filters by area' do
      other_area = create(:area)
      result = ClinicFilter.filter([], other_area.id, false)
      expect(result.map { |r| r[:clinic] }).not_to include(clinic)
    end

    it 'returns empty for has_slot when no open slots' do
      AvailableSlot.update_all(status: 'reserved')
      result = ClinicFilter.filter([], area.id, true)
      expect(result).to be_empty
    end
  end
end
