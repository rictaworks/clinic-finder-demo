FactoryBot.define do
  factory :clinic_department do
    association :clinic
    association :department
  end
end
