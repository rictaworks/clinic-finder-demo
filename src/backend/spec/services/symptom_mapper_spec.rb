require 'rails_helper'

RSpec.describe SymptomMapper do
  describe '.map' do
    it 'returns empty array for blank input' do
      expect(SymptomMapper.map('')).to eq([])
      expect(SymptomMapper.map(nil)).to eq([])
    end

    it 'returns array of departments for known symptom' do
      dept = create(:department, name: '内科')
      create(:symptom, keyword: '発熱', normalized: '発熱', department: dept)
      result = SymptomMapper.map('発熱')
      expect(result).to be_an(Array)
      expect(result.first).to be_a(Department)
    end

    it 'returns empty array for unknown symptom' do
      result = SymptomMapper.map('zzz_unknown_symptom_xyz')
      expect(result).to eq([])
    end
  end
end
