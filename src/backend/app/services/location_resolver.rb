class LocationResolver
  def self.resolve(text)
    return nil if text.blank?
    normalized = normalize_text(text)
    Rails.logger.info("[LocationResolver] Resolving location: #{normalized}")
    area = match_area(normalized)
    Rails.logger.info("[LocationResolver] Resolved to area: #{area&.name || 'nil'}")
    area&.id
  rescue => e
    Rails.logger.error("[LocationResolver] resolve error: #{e.message}")
    nil
  end

  private

  def self.normalize_text(text)
    text.to_s.unicode_normalize(:nfkc).strip
  end

  def self.match_area(text)
    Area.all.find do |area|
      area.name.include?(text) ||
        text.include?(area.name) ||
        area.en_name.to_s.downcase.include?(text.downcase) ||
        text.downcase.include?(area.en_name.to_s.downcase) ||
        area.kana.to_s.include?(text) ||
        alias_match?(area, text)
    end
  end

  def self.alias_match?(area, text)
    return false if area.aliases.blank?
    area.aliases.split(',').any? do |a|
      normalized = a.strip
      text.include?(normalized) || normalized.include?(text)
    end
  end
end
