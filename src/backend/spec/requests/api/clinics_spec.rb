require 'rails_helper'

RSpec.describe 'Api::Clinics', type: :request do
  let!(:clinic) { create(:clinic) }

  describe 'GET /api/clinics/:id' do
    it 'returns 200 with clinic data' do
      get "/api/clinics/#{clinic.id}"
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['id']).to eq(clinic.id)
      expect(json['name']).to eq(clinic.name)
    end

    it 'returns 404 for unknown id' do
      get '/api/clinics/99999'
      expect(response).to have_http_status(:not_found)
    end
  end
end
