FactoryBot.define do
  factory :area do
    sequence(:name) { |n| "エリア#{n}" }
    kana { 'エリア' }
    en_name { 'area' }
    aliases { '' }
  end
end
