FactoryBot.define do
  factory :reservation do
    session_id { SecureRandom.uuid }
    association :clinic
    slot_id { nil }
    age_group { 'adult' }
    symptom_note { '風邪の症状' }
    status { 'pending' }
    reserved_at { Time.current }
  end
end
