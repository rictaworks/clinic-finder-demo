class Clinic < ApplicationRecord
  belongs_to :area
  has_many :clinic_departments
  has_many :departments, through: :clinic_departments
  has_many :available_slots
  has_many :reservations
  validates :name, presence: true
  validates :rating, numericality: { greater_than_or_equal_to: 1.0, less_than_or_equal_to: 5.0 }, allow_nil: true
end
