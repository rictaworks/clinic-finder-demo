class Symptom < ApplicationRecord
  belongs_to :department
  validates :keyword, presence: true
  validates :normalized, presence: true
end
