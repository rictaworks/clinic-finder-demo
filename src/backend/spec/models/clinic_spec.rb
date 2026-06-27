require 'rails_helper'

RSpec.describe Clinic, type: :model do
  describe 'validations' do
    it 'validates name presence' do
      clinic = Clinic.new(name: '', area: build(:area))
      expect(clinic).not_to be_valid
    end

    it 'validates rating numericality' do
      clinic = build(:clinic, rating: 0.5)
      expect(clinic).not_to be_valid
      clinic.rating = 5.5
      expect(clinic).not_to be_valid
      clinic.rating = 4.0
      expect(clinic).to be_valid
    end

    it 'allows nil rating' do
      clinic = build(:clinic, rating: nil)
      expect(clinic).to be_valid
    end
  end
end
