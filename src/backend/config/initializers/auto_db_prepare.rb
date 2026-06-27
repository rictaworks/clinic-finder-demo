# Auto-prepare database after Rails initializes (including eager load).
# Uses after_initialize so models like Area/Clinic are available for seeds.
# Idempotent: create+schema+seed on first boot; migrate-only on subsequent boots.

Rails.application.config.after_initialize do
  next unless Rails.env.production?

  begin
    ActiveRecord::Tasks::DatabaseTasks.prepare_all
    Rails.logger.info("[AutoDB] db:prepare completed successfully")
  rescue => e
    Rails.logger.error("[AutoDB] db:prepare failed: #{e.message}")
  end
end
