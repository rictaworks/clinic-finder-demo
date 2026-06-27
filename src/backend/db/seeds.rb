# Areas (10)
areas_data = [
  { name: '渋谷', kana: 'シブヤ', en_name: 'shibuya', aliases: '渋谷区,しぶや' },
  { name: '新宿', kana: 'シンジュク', en_name: 'shinjuku', aliases: '新宿区,しんじゅく' },
  { name: '池袋', kana: 'イケブクロ', en_name: 'ikebukuro', aliases: '豊島区,いけぶくろ' },
  { name: '品川', kana: 'シナガワ', en_name: 'shinagawa', aliases: '品川区,しながわ' },
  { name: '銀座', kana: 'ギンザ', en_name: 'ginza', aliases: '中央区,ぎんざ' },
  { name: '上野', kana: 'ウエノ', en_name: 'ueno', aliases: '台東区,うえの' },
  { name: '秋葉原', kana: 'アキハバラ', en_name: 'akihabara', aliases: '千代田区,あきはばら' },
  { name: '吉祥寺', kana: 'キチジョウジ', en_name: 'kichijoji', aliases: '武蔵野市,きちじょうじ' },
  { name: '横浜', kana: 'ヨコハマ', en_name: 'yokohama', aliases: '横浜市,よこはま' },
  { name: '川崎', kana: 'カワサキ', en_name: 'kawasaki', aliases: '川崎市,かわさき' }
]
areas_data.each { |a| Area.find_or_create_by!(name: a[:name]) { |r| r.assign_attributes(a) } }
areas = Area.all.index_by(&:name)

# Departments (12)
depts_data = [
  { name: '内科', description: '内科的疾患全般を診療します' },
  { name: '外科', description: '外科的処置・手術を行います' },
  { name: '整形外科', description: '骨・関節・筋肉の疾患を診療します' },
  { name: '眼科', description: '目の疾患を診療します' },
  { name: '耳鼻科', description: '耳・鼻・喉の疾患を診療します' },
  { name: '皮膚科', description: '皮膚疾患を診療します' },
  { name: '小児科', description: '小児の疾患を診療します' },
  { name: '神経内科', description: '神経系疾患を診療します' },
  { name: '消化器科', description: '消化器系疾患を診療します' },
  { name: '呼吸器科', description: '呼吸器系疾患を診療します' },
  { name: '歯科', description: '歯・口腔の疾患を診療します' },
  { name: '総合内科', description: '総合的な内科疾患を診療します' }
]
depts_data.each { |d| Department.find_or_create_by!(name: d[:name]) { |r| r.assign_attributes(d) } }
depts = Department.all.index_by(&:name)

# Symptoms (5 per department = 60 total)
symptoms_data = {
  '内科' => [
    { keyword: '発熱', normalized: '発熱', priority: 1 },
    { keyword: '咳', normalized: '咳', priority: 2 },
    { keyword: '倦怠感', normalized: '倦怠感', priority: 2 },
    { keyword: '頭痛', normalized: '頭痛', priority: 3 },
    { keyword: '下痢', normalized: '下痢', priority: 3 }
  ],
  '外科' => [
    { keyword: '切り傷', normalized: '切り傷', priority: 1 },
    { keyword: '打撲', normalized: '打撲', priority: 2 },
    { keyword: '骨折', normalized: '骨折', priority: 1 },
    { keyword: 'やけど', normalized: 'やけど', priority: 2 },
    { keyword: '腫れ', normalized: '腫れ', priority: 3 }
  ],
  '整形外科' => [
    { keyword: '腰痛', normalized: '腰痛', priority: 1 },
    { keyword: '膝の痛み', normalized: '膝の痛み', priority: 1 },
    { keyword: '肩こり', normalized: '肩こり', priority: 2 },
    { keyword: '捻挫', normalized: '捻挫', priority: 2 },
    { keyword: '関節痛', normalized: '関節痛', priority: 2 }
  ],
  '眼科' => [
    { keyword: '目が痛い', normalized: '目が痛い', priority: 1 },
    { keyword: '視力低下', normalized: '視力低下', priority: 2 },
    { keyword: '充血', normalized: '充血', priority: 2 },
    { keyword: '目のかゆみ', normalized: '目のかゆみ', priority: 3 },
    { keyword: '目やに', normalized: '目やに', priority: 3 }
  ],
  '耳鼻科' => [
    { keyword: '鼻水', normalized: '鼻水', priority: 1 },
    { keyword: '耳が痛い', normalized: '耳が痛い', priority: 1 },
    { keyword: 'のどが痛い', normalized: 'のどが痛い', priority: 2 },
    { keyword: '鼻づまり', normalized: '鼻づまり', priority: 2 },
    { keyword: '難聴', normalized: '難聴', priority: 3 }
  ],
  '皮膚科' => [
    { keyword: 'かゆみ', normalized: 'かゆみ', priority: 1 },
    { keyword: '湿疹', normalized: '湿疹', priority: 1 },
    { keyword: 'じんましん', normalized: 'じんましん', priority: 2 },
    { keyword: 'にきび', normalized: 'にきび', priority: 3 },
    { keyword: '水虫', normalized: '水虫', priority: 3 }
  ],
  '小児科' => [
    { keyword: '子供の発熱', normalized: '子供の発熱', priority: 1 },
    { keyword: '子供の咳', normalized: '子供の咳', priority: 2 },
    { keyword: '夜泣き', normalized: '夜泣き', priority: 3 },
    { keyword: '食欲不振', normalized: '食欲不振', priority: 3 },
    { keyword: '成長不良', normalized: '成長不良', priority: 3 }
  ],
  '神経内科' => [
    { keyword: 'めまい', normalized: 'めまい', priority: 1 },
    { keyword: '手足のしびれ', normalized: '手足のしびれ', priority: 1 },
    { keyword: '物忘れ', normalized: '物忘れ', priority: 2 },
    { keyword: '歩行障害', normalized: '歩行障害', priority: 2 },
    { keyword: 'けいれん', normalized: 'けいれん', priority: 1 }
  ],
  '消化器科' => [
    { keyword: '腹痛', normalized: '腹痛', priority: 1 },
    { keyword: '胃が痛い', normalized: '胃が痛い', priority: 1 },
    { keyword: '嘔吐', normalized: '嘔吐', priority: 2 },
    { keyword: '胸やけ', normalized: '胸やけ', priority: 2 },
    { keyword: '便秘', normalized: '便秘', priority: 3 }
  ],
  '呼吸器科' => [
    { keyword: '息切れ', normalized: '息切れ', priority: 1 },
    { keyword: '慢性的な咳', normalized: '慢性的な咳', priority: 1 },
    { keyword: '喘息', normalized: '喘息', priority: 1 },
    { keyword: '痰', normalized: '痰', priority: 2 },
    { keyword: '胸の痛み', normalized: '胸の痛み', priority: 2 }
  ],
  '歯科' => [
    { keyword: '歯が痛い', normalized: '歯が痛い', priority: 1 },
    { keyword: '歯茎の腫れ', normalized: '歯茎の腫れ', priority: 2 },
    { keyword: '虫歯', normalized: '虫歯', priority: 1 },
    { keyword: '歯の欠け', normalized: '歯の欠け', priority: 2 },
    { keyword: '口臭', normalized: '口臭', priority: 3 }
  ],
  '総合内科' => [
    { keyword: '全身倦怠感', normalized: '全身倦怠感', priority: 1 },
    { keyword: '体重減少', normalized: '体重減少', priority: 2 },
    { keyword: '高血圧', normalized: '高血圧', priority: 2 },
    { keyword: '糖尿病', normalized: '糖尿病', priority: 2 },
    { keyword: '高脂血症', normalized: '高脂血症', priority: 3 }
  ]
}

symptoms_data.each do |dept_name, symptoms|
  dept = depts[dept_name]
  symptoms.each do |s|
    Symptom.find_or_create_by!(keyword: s[:keyword], department: dept) do |sym|
      sym.normalized = s[:normalized]
      sym.priority = s[:priority]
    end
  end
end

# Clinics (2 per area = 20 total)
clinics_data = [
  { name: '渋谷セントラルクリニック', area: '渋谷', address: '東京都渋谷区道玄坂1-1-1', phone_display: '03-1234-5678', rating: 4.5, open_time: '09:00', close_time: '18:00' },
  { name: '渋谷メディカルセンター', area: '渋谷', address: '東京都渋谷区渋谷2-2-2', phone_display: '03-1234-5679', rating: 4.0, open_time: '10:00', close_time: '20:00' },
  { name: '新宿ファミリークリニック', area: '新宿', address: '東京都新宿区西新宿1-1-1', phone_display: '03-2345-6789', rating: 4.2, open_time: '09:00', close_time: '18:00' },
  { name: '新宿健康クリニック', area: '新宿', address: '東京都新宿区新宿3-3-3', phone_display: '03-2345-6790', rating: 3.8, open_time: '10:00', close_time: '20:00' },
  { name: '池袋ウェストクリニック', area: '池袋', address: '東京都豊島区西池袋1-1-1', phone_display: '03-3456-7890', rating: 4.3, open_time: '09:00', close_time: '18:00' },
  { name: '池袋メディカルプラザ', area: '池袋', address: '東京都豊島区池袋2-2-2', phone_display: '03-3456-7891', rating: 4.1, open_time: '10:00', close_time: '20:00' },
  { name: '品川シーサイドクリニック', area: '品川', address: '東京都品川区東品川1-1-1', phone_display: '03-4567-8901', rating: 4.4, open_time: '09:00', close_time: '18:00' },
  { name: '品川駅前クリニック', area: '品川', address: '東京都品川区北品川2-2-2', phone_display: '03-4567-8902', rating: 3.9, open_time: '10:00', close_time: '20:00' },
  { name: '銀座中央クリニック', area: '銀座', address: '東京都中央区銀座1-1-1', phone_display: '03-5678-9012', rating: 4.7, open_time: '09:00', close_time: '18:00' },
  { name: '銀座メディカルケア', area: '銀座', address: '東京都中央区銀座5-5-5', phone_display: '03-5678-9013', rating: 4.5, open_time: '10:00', close_time: '20:00' },
  { name: '上野パーククリニック', area: '上野', address: '東京都台東区上野2-2-2', phone_display: '03-6789-0123', rating: 4.0, open_time: '09:00', close_time: '18:00' },
  { name: '上野駅前内科', area: '上野', address: '東京都台東区上野3-3-3', phone_display: '03-6789-0124', rating: 3.7, open_time: '10:00', close_time: '20:00' },
  { name: '秋葉原テックメディカル', area: '秋葉原', address: '東京都千代田区外神田1-1-1', phone_display: '03-7890-1234', rating: 4.1, open_time: '09:00', close_time: '18:00' },
  { name: '秋葉原駅前クリニック', area: '秋葉原', address: '東京都千代田区外神田4-4-4', phone_display: '03-7890-1235', rating: 3.8, open_time: '10:00', close_time: '20:00' },
  { name: '吉祥寺グリーンクリニック', area: '吉祥寺', address: '東京都武蔵野市吉祥寺本町1-1-1', phone_display: '0422-12-3456', rating: 4.6, open_time: '09:00', close_time: '18:00' },
  { name: '吉祥寺メディカルセンター', area: '吉祥寺', address: '東京都武蔵野市吉祥寺南町2-2-2', phone_display: '0422-12-3457', rating: 4.3, open_time: '10:00', close_time: '20:00' },
  { name: '横浜みなとクリニック', area: '横浜', address: '神奈川県横浜市中区山下町1-1', phone_display: '045-123-4567', rating: 4.4, open_time: '09:00', close_time: '18:00' },
  { name: '横浜駅前メディカル', area: '横浜', address: '神奈川県横浜市西区高島2-2-2', phone_display: '045-123-4568', rating: 4.0, open_time: '10:00', close_time: '20:00' },
  { name: '川崎健康クリニック', area: '川崎', address: '神奈川県川崎市川崎区砂子1-1-1', phone_display: '044-123-4567', rating: 3.9, open_time: '09:00', close_time: '18:00' },
  { name: '川崎ウェルネスクリニック', area: '川崎', address: '神奈川県川崎市中原区小杉2-2-2', phone_display: '044-123-4568', rating: 4.2, open_time: '10:00', close_time: '20:00' }
]

clinics_data.each do |c|
  Clinic.find_or_create_by!(name: c[:name]) do |clinic|
    clinic.area = areas[c[:area]]
    clinic.address = c[:address]
    clinic.phone_display = c[:phone_display]
    clinic.rating = c[:rating]
    clinic.open_time = c[:open_time]
    clinic.close_time = c[:close_time]
  end
end
all_clinics = Clinic.all.to_a
dept_list = Department.all.to_a

# clinic_departments (2 per clinic = 40 total)
all_clinics.each_with_index do |clinic, i|
  d1 = dept_list[i % dept_list.size]
  d2 = dept_list[(i + 1) % dept_list.size]
  [d1, d2].each do |dept|
    ClinicDepartment.find_or_create_by!(clinic: clinic, department: dept)
  end
end

# available_slots: today to today+6, 2 slots per clinic per day (280 total)
slot_times = ['10:00', '14:00']
(0..6).each do |day_offset|
  slot_date = Date.current + day_offset
  all_clinics.each do |clinic|
    slot_times.each do |slot_time|
      AvailableSlot.find_or_create_by!(clinic: clinic, slot_date: slot_date, slot_time: slot_time) do |slot|
        slot.status = 'open'
        slot.capacity = 1
      end
    end
  end
end

Rails.logger.info("Seed data loaded successfully")
puts "Seed completed: #{Area.count} areas, #{Department.count} departments, #{Symptom.count} symptoms, #{Clinic.count} clinics, #{AvailableSlot.count} slots"
