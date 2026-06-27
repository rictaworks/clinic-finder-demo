require 'rails_helper'

RSpec.describe HoneypotGuard do
  describe '.check' do
    it 'returns false when honeypot field is filled' do
      result = HoneypotGuard.check({ '_hp' => 'bot_value' }, nil)
      expect(result).to be false
    end

    it 'returns false when submission is too fast' do
      timestamp = (Time.current - 0.5).to_f.to_s
      result = HoneypotGuard.check({}, timestamp)
      expect(result).to be false
    end

    it 'returns true for valid submission' do
      timestamp = (Time.current - 5).to_f.to_s
      result = HoneypotGuard.check({ '_hp' => '' }, timestamp)
      expect(result).to be true
    end

    it 'returns true when no timestamp provided' do
      result = HoneypotGuard.check({}, nil)
      expect(result).to be true
    end
  end
end
