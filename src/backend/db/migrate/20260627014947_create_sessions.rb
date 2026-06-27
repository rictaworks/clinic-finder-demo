class CreateSessions < ActiveRecord::Migration[8.1]
  def change
    create_table :sessions do |t|
      t.string :session_id, null: false
      t.datetime :expires_at, null: false

      t.timestamps
    end
    add_index :sessions, :session_id, unique: true
  end
end
