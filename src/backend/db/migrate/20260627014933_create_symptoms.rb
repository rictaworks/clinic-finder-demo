class CreateSymptoms < ActiveRecord::Migration[8.1]
  def change
    create_table :symptoms do |t|
      t.string :keyword, null: false
      t.string :normalized, null: false
      t.integer :department_id, null: false
      t.integer :priority, default: 1

      t.timestamps
    end
  end
end
