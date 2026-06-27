# Auto-prepare database on application startup.
# Runs db:prepare (create + schema:load + seed on first boot; migrate on subsequent boots).
# Idempotent: safe to run on every container restart.
# Required because Railway bypasses the Docker ENTRYPOINT when startCommand is set.

if Rails.env.production? && defined?(ActiveRecord::Base)
  begin
    ActiveRecord::Tasks::DatabaseTasks.prepare_all
    Rails.logger.info("[AutoDB] db:prepare completed successfully")
  rescue => e
    Rails.logger.error("[AutoDB] db:prepare failed: #{e.message}")
  end
end
