class CreateClinicDepartments < ActiveRecord::Migration[8.1]
  def change
    create_table :clinic_departments do |t|
      t.integer :clinic_id, null: false
      t.integer :department_id, null: false

      t.timestamps
    end
  end
end
