class AvailableSlot < ApplicationRecord
  belongs_to :clinic
  has_many :reservations, foreign_key: :slot_id
  validates :slot_date, presence: true
  validates :slot_time, presence: true
  validates :status, inclusion: { in: %w[open reserved] }
end
