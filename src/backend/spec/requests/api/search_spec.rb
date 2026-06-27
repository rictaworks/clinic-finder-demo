require 'rails_helper'

RSpec.describe 'Api::Search', type: :request do
  describe 'POST /api/search' do
    before do
      area = create(:area, name: '渋谷', en_name: 'shibuya', kana: 'シブヤ', aliases: '渋谷区')
      create(:clinic, area: area)
    end

    it 'returns 200 with clinics array' do
      post '/api/search', params: { symptom: '発熱', location: '渋谷', has_slot: false }
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json).to have_key('clinics')
      expect(json['clinics']).to be_an(Array)
    end
  end
end
