require 'rails_helper'

RSpec.describe Reservation, type: :model do
  describe 'validations' do
    it 'validates age_group inclusion' do
      r = Reservation.new(age_group: 'invalid')
      r.valid?
      expect(r.errors[:age_group]).to be_present
    end

    it 'validates status inclusion' do
      r = Reservation.new(status: 'invalid')
      r.valid?
      expect(r.errors[:status]).to be_present
    end

    it 'is valid with correct age_group' do
      %w[child teen adult senior].each do |ag|
        r = Reservation.new(age_group: ag, status: 'pending')
        r.valid?
        expect(r.errors[:age_group]).to be_empty
      end
    end
  end
end
