FactoryBot.define do
  factory :department do
    sequence(:name) { |n| "診療科#{n}" }
    description { '診療科の説明' }
  end
end
