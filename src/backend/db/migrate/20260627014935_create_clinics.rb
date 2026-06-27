class CreateClinics < ActiveRecord::Migration[8.1]
  def change
    create_table :clinics do |t|
      t.string :name, null: false
      t.integer :area_id, null: false
      t.string :address
      t.string :phone_display
      t.decimal :rating, precision: 2, scale: 1
      t.string :open_time
      t.string :close_time

      t.timestamps
    end
  end
end
