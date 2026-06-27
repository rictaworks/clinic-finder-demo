FactoryBot.define do
  factory :reset_log do
    reset_date { Date.current }
    executed_at { Time.current }
  end
end
