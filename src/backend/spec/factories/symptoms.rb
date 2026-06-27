FactoryBot.define do
  factory :symptom do
    sequence(:keyword) { |n| "症状#{n}" }
    sequence(:normalized) { |n| "症状#{n}" }
    priority { 1 }
    association :department
  end
end
