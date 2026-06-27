class CreateResetLogs < ActiveRecord::Migration[8.1]
  def change
    create_table :reset_logs do |t|
      t.date :reset_date, null: false
      t.datetime :executed_at

      t.timestamps
    end
  end
end
