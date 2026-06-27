class CreateReservations < ActiveRecord::Migration[8.1]
  def change
    create_table :reservations do |t|
      t.string :session_id, null: false
      t.integer :clinic_id, null: false
      t.integer :slot_id, null: false
      t.string :age_group, null: false
      t.text :symptom_note
      t.string :status, default: 'pending'
      t.datetime :reserved_at

      t.timestamps
    end
  end
end
