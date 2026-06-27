FactoryBot.define do
  factory :available_slot do
    association :clinic
    slot_date { Date.current + 1 }
    slot_time { '10:00' }
    status { 'open' }
    capacity { 1 }
  end
end
