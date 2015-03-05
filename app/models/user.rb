# encoding: utf-8
require 'sinatra/r18n'

class User < Sequel::Model
	plugin :secure_password

	one_to_many :items
	one_to_many :feeds
	one_to_many :folders

	def validate
		super
		errors.add(:cleanup_after, 'must be greater than 0') unless self.cleanup_after.nil? or self.cleanup_after > 0
		errors.add(:refresh_timeout, 'must be greater than 0') unless self.cleanup_after.nil? or self.refresh_timeout > 0
		errors.add(:sync_timeout, 'must be greater than 0') unless self.sync_timeout.nil? or self.sync_timeout > 0
		errors.add(:items_per_page, 'must be greater than 0') unless self.items_per_page.nil? or self.items_per_page > 0
		errors.add(:locale, 'is not a valid locale') unless self.default_locale.nil? or self.validate_locale
	end

	def authorize(roles)
		return true if self.role = 'admin'

		roles.each do |role|
			return true if self.role = role.to_s
		end

		return false
	end

	def validate_locale
		R18n.available_locales.each do |locale|
			return true if locale.code == self.default_locale
		end
		false
	end

end
