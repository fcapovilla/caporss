# encoding: utf-8
require 'dm-migrations/migration_runner'

if repository(:default).adapter.options[:adapter] != 'sqlite3'
	migration 1, :update_favicon_data_column do
		up do
			execute(<<-SQL)
				ALTER TABLE favicons ALTER COLUMN data TYPE text;
			SQL
		end
	end
end

migration 2, :multi_user_support do
	up do
		# Set default users
		admin = User.new(
			:username => 'admin',
			:password => 'admin',
			:roles => [:admin]
		)
		admin.save

		User.new(
			:username => 'sync',
			:password => 'sync',
			:roles => [:sync]
		).save

		# Assign folders, feeds and items without user to the admin
		Folder.all(:user => nil).update!(:user => admin)
		Feed.all(:user => nil).update!(:user => admin)
		Item.all(:user => nil).update!(:user => admin)

		# Move settings to the admin user
		if setting = Setting.first(:name => 'cleanup_after')
			admin.cleanup_after = setting.value.to_i
			setting.destroy
		end
		if setting = Setting.first(:name => 'refresh_timeout')
			admin.refresh_timeout = setting.value.to_i
			setting.destroy
		end
		if setting = Setting.first(:name => 'sync_timeout')
			admin.sync_timeout = setting.value.to_i
			setting.destroy
		end
		if setting = Setting.first(:name => 'default_locale')
			admin.default_locale = setting.value
			setting.destroy
		end
		if setting = Setting.first(:name => 'items_per_page')
			admin.items_per_page = setting.value.to_i
			setting.destroy
		end

		admin.save

		# Delete old username settings
		if setting = Setting.first(:name => 'username')
			setting.destroy
		end
		if setting = Setting.first(:name => 'salt')
			setting.destroy
		end
		if setting = Setting.first(:name => 'password')
			setting.destroy
		end
	end
end

migrate_up!
