class Reservation < ApplicationRecord
  belongs_to :session, foreign_key: :session_id, primary_key: :session_id
  belongs_to :clinic
  belongs_to :available_slot, foreign_key: :slot_id
  validates :age_group, inclusion: { in: %w[child teen adult senior] }
  validates :status, inclusion: { in: %w[pending cancelled] }
end
