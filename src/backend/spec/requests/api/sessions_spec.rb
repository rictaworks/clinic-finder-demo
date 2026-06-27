require 'rails_helper'

RSpec.describe 'Api::Sessions', type: :request do
  describe 'POST /api/sessions' do
    it 'returns 201 with session_id' do
      post '/api/sessions', headers: { 'Content-Type' => 'application/json' }
      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json).to have_key('session_id')
      expect(json['session_id']).to be_present
    end
  end
end
