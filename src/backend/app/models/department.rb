class Department < ApplicationRecord
  has_many :symptoms
  has_many :clinic_departments
  has_many :clinics, through: :clinic_departments
  validates :name, presence: true
end
