require 'rails_helper'

RSpec.describe LocationResolver do
  describe '.resolve' do
    it 'returns nil for blank input' do
      expect(LocationResolver.resolve('')).to be_nil
      expect(LocationResolver.resolve(nil)).to be_nil
    end

    it 'returns area_id for known area name' do
      area = create(:area, name: '渋谷', en_name: 'shibuya', kana: 'シブヤ', aliases: '渋谷区,しぶや')
      result = LocationResolver.resolve('渋谷')
      expect(result).to eq(area.id)
    end

    it 'returns nil for unknown location' do
      result = LocationResolver.resolve('どこか知らない場所')
      expect(result).to be_nil
    end
  end
end
