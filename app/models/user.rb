# encoding: utf-8
class User
	include DataMapper::Resource

	property :id, Serial
	property :username, String, :length => 1..100, :required => true, :unique => true
	property :password, BCryptHash, :required => true
	property :roles, Flag[:admin, :user, :sync], :default => :user

	property :cleanup_after, Integer, :default => 300
	property :refresh_timeout, Integer, :default => 15
	property :sse_refresh, Boolean, :default => false
	property :desktop_notifications, Boolean, :default => true
	property :sync_timeout, Integer, :default => (ENV['IS_CLOUD']? 30 : 0)
	property :default_locale, String, :length => 1..5, :default => 'en'
	property :items_per_page, Integer, :default => 50

	has n, :items, :constraint => :destroy
	has n, :feeds, :constraint => :destroy
	has n, :folders, :constraint => :destroy

	validates_numericality_of :cleanup_after, :gt => 0
	validates_numericality_of :refresh_timeout, :gte => 0
	validates_numericality_of :sync_timeout, :gte => 0
	validates_numericality_of :items_per_page, :gt => 0
	validates_with_method :validate_locale

	def authorize(roles)
		return true if self.roles.include?(:admin)

		roles.each do |role|
			return true if self.roles.include?(role)
		end

		return false
	end

	def validate_locale
		if defined? R18n then
			R18n.available_locales.each do |locale|
				return true if locale.code == self.default_locale
			end
		end
		[false, "Locale '#{self.default_locale}' is not a known locale."]
	end

end
