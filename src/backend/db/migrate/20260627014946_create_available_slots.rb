class CreateAvailableSlots < ActiveRecord::Migration[8.1]
  def change
    create_table :available_slots do |t|
      t.integer :clinic_id, null: false
      t.date :slot_date, null: false
      t.string :slot_time, null: false
      t.string :status, default: 'open'
      t.integer :capacity, default: 1

      t.timestamps
    end
  end
end
