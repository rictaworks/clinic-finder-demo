class ResetLog < ApplicationRecord
  validates :reset_date, presence: true
end
