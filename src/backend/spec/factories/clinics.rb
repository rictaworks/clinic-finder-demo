FactoryBot.define do
  factory :clinic do
    sequence(:name) { |n| "クリニック#{n}" }
    association :area
    address { '東京都渋谷区1-1-1' }
    phone_display { '03-0000-0000' }
    rating { 4.0 }
    open_time { '09:00' }
    close_time { '18:00' }
  end
end
