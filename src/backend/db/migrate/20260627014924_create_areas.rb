class CreateAreas < ActiveRecord::Migration[8.1]
  def change
    create_table :areas do |t|
      t.string :name, null: false
      t.string :kana
      t.string :en_name
      t.text :aliases

      t.timestamps
    end
  end
end
