class Session < ApplicationRecord
  has_many :reservations, foreign_key: :session_id, primary_key: :session_id
  validates :session_id, presence: true, uniqueness: true
  validates :expires_at, presence: true
end
