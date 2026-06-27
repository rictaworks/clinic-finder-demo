require 'rails_helper'

RSpec.describe Area, type: :model do
  describe 'validations' do
    it 'validates name presence' do
      area = Area.new(name: '')
      expect(area).not_to be_valid
      expect(area.errors[:name]).to include("can't be blank")
    end

    it 'is valid with a name' do
      area = build(:area)
      expect(area).to be_valid
    end
  end

  describe 'associations' do
    it { is_expected.to have_many(:clinics) }
  end
end
