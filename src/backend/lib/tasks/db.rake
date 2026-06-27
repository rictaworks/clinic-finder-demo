namespace :db do
  desc 'Daily reset of transaction data'
  task reset_daily: :environment do
    DailyResetJob.run(Time.now.utc)
  end
end
