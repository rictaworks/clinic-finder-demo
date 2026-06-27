require 'rails_helper'

RSpec.describe 'Api::Reservations', type: :request do
  let!(:session_record) { create(:session) }
  let!(:clinic) { create(:clinic) }
  let!(:slot) { create(:available_slot, clinic: clinic, status: 'open') }
  let(:valid_timestamp) { (Time.current - 5).to_f.to_s }

  describe 'POST /api/reservations' do
    it 'creates a reservation' do
      post '/api/reservations',
           params: {
             clinic_id: clinic.id,
             slot_id: slot.id,
             age_group: 'adult',
             symptom_note: '発熱',
             _ts: valid_timestamp,
             _hp: ''
           },
           headers: { 'Cookie' => "clinic_session_id=#{session_record.session_id}" }
      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json).to have_key('id')
    end
  end

  describe 'GET /api/reservations/:id' do
    let!(:reservation) do
      slot.update!(status: 'reserved')
      create(:reservation, session_id: session_record.session_id, clinic: clinic, slot_id: slot.id)
    end

    it 'returns the reservation' do
      get "/api/reservations/#{reservation.id}",
          headers: { 'Cookie' => "clinic_session_id=#{session_record.session_id}" }
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['id']).to eq(reservation.id)
    end
  end

  describe 'DELETE /api/reservations/:id' do
    let!(:reservation) do
      slot.update!(status: 'reserved')
      create(:reservation, session_id: session_record.session_id, clinic: clinic, slot_id: slot.id)
    end

    it 'cancels the reservation' do
      delete "/api/reservations/#{reservation.id}",
             headers: { 'Cookie' => "clinic_session_id=#{session_record.session_id}" }
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['status']).to eq('cancelled')
    end
  end
end
