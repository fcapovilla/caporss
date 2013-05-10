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
		).save

		User.new(
			:username => 'sync',
			:password => 'sync',
			:roles => [:sync]
		).save

		# Assign folders, feeds and items without user to the admin
		Folder.all(:user => nil).update!(:user => admin)
		Feed.all(:user => nil).update!(:user => admin)
		Item.all(:user => nil).update!(:user => admin)
	end
end

migrate_up!
