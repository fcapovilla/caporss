# encoding: utf-8
class User
	include DataMapper::Resource

	property :id, Serial
	property :username, String, :length => 100, :required => true
	property :password, BCryptHash, :required => true
	property :roles, Flag[:admin, :user, :sync], :default => :user

	property :cleanup_after, Integer, :default => 300
	property :refresh_timeout, Integer, :default => 0
	property :sync_timeout, Integer, :default => 0
	property :default_locale, String, :length => 3, :default => 'en'
	property :items_per_page, Integer, :default => 50

	has n, :items, :constraint => :destroy
	has n, :feeds, :constraint => :destroy
	has n, :folders, :constraint => :destroy

	def authorize(*roles)
		return true if self.roles.include?(:admin)

		roles.each do |role|
			return true if self.roles.include?(role)
		end

		return false
	end
end
