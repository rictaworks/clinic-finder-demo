# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_06_27_014950) do
  create_table "areas", force: :cascade do |t|
    t.text "aliases"
    t.datetime "created_at", null: false
    t.string "en_name"
    t.string "kana"
    t.string "name", null: false
    t.datetime "updated_at", null: false
  end

  create_table "available_slots", force: :cascade do |t|
    t.integer "capacity", default: 1
    t.integer "clinic_id", null: false
    t.datetime "created_at", null: false
    t.date "slot_date", null: false
    t.string "slot_time", null: false
    t.string "status", default: "open"
    t.datetime "updated_at", null: false
  end

  create_table "clinic_departments", force: :cascade do |t|
    t.integer "clinic_id", null: false
    t.datetime "created_at", null: false
    t.integer "department_id", null: false
    t.datetime "updated_at", null: false
  end

  create_table "clinics", force: :cascade do |t|
    t.string "address"
    t.integer "area_id", null: false
    t.string "close_time"
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.string "open_time"
    t.string "phone_display"
    t.decimal "rating", precision: 2, scale: 1
    t.datetime "updated_at", null: false
  end

  create_table "departments", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "description"
    t.string "name", null: false
    t.datetime "updated_at", null: false
  end

  create_table "reservations", force: :cascade do |t|
    t.string "age_group", null: false
    t.integer "clinic_id", null: false
    t.datetime "created_at", null: false
    t.datetime "reserved_at"
    t.string "session_id", null: false
    t.integer "slot_id", null: false
    t.string "status", default: "pending"
    t.text "symptom_note"
    t.datetime "updated_at", null: false
  end

  create_table "reset_logs", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "executed_at"
    t.date "reset_date", null: false
    t.datetime "updated_at", null: false
  end

  create_table "sessions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "expires_at", null: false
    t.string "session_id", null: false
    t.datetime "updated_at", null: false
    t.index ["session_id"], name: "index_sessions_on_session_id", unique: true
  end

  create_table "symptoms", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "department_id", null: false
    t.string "keyword", null: false
    t.string "normalized", null: false
    t.integer "priority", default: 1
    t.datetime "updated_at", null: false
  end
end
