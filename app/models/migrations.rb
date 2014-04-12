# encoding: utf-8
require 'dm-migrations/migration_runner'

adapter = repository(:default).adapter.options[:adapter]

if ['mysql', 'postgresql'].include? adapter
	migration 1, :update_favicon_data_column do
		up do
			if adapter == 'mysql'
				execute 'ALTER TABLE favicons MODIFY data TEXT'
			elsif adapter == 'postgresql'
				execute 'ALTER TABLE favicons ALTER COLUMN data TYPE text'
			end
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

migration 3, :folder_title_not_unique do
	up do
		begin
			if adapter == 'mysql'
				execute 'DROP INDEX "unique_folders_title" ON folders'
			elsif adapter == 'postgresql'
				execute 'DROP INDEX "unique_folders_title"'
			end
		rescue
			puts ">> Index doesn't exist. Nothing to do."
		end
	end
end

if ['mysql', 'postgresql'].include? adapter
	migration 4, :update_default_locale_size do
		up do
			if adapter == 'mysql'
				execute 'ALTER TABLE users MODIFY default_locale VARCHAR(5)'
			elsif adapter == 'postgresql'
				execute 'ALTER TABLE users ALTER COLUMN default_locale TYPE VARCHAR(5)'
			end
		end
	end
end

migration 5, :add_guid do
	up do
		Feed.all.each do |feed|
			puts "Fetching GUIDs for feed #{feed.title}"

			feed_data = Feedjira::Feed.fetch_and_parse(feed.url, {:max_redirects => 3, :timeout => 30})
			next if feed_data.kind_of?(Fixnum) or feed_data.nil?

			feed_data.entries.each do |entry|
				next unless entry.id

				entry.sanitize!

				items = feed.items.all(:title => entry.title, :url => entry.url, :date => entry.published)
				if items.count == 1
					items[0].update(:guid => entry.id)
					puts " Updated #{entry.id}"
				end
			end
		end
	end
end

migration 6, :add_pubsubhubbub do
	up do
		Feed.all.each do |feed|
			feed_data = Feedjira::Feed.fetch_and_parse(feed.url, {:max_redirects => 3, :timeout => 30})
			next if feed_data.kind_of?(Fixnum) or feed_data.nil?

			if feed_data.hub
				puts "Found a Pubsubhubbub hub for feed #{feed.title}"

				feed.pshb_hub = feed_data.hub
				if feed.topic and feed.topic =~ /^#{URI::regexp}$/
					self.pshb_topic = feed.topic
				else
					self.pshb_topic = self.url
				end
				feed.save
			end
		end
	end
end

if ['mysql', 'postgresql'].include? adapter
	migration 7, :update_pshb_column do
		up do
			if adapter == 'mysql'
				execute 'ALTER TABLE feeds MODIFY pshb INT(11) DEFAULT 1'
			elsif adapter == 'postgresql'
				execute 'ALTER TABLE feeds ALTER COLUMN pshb TYPE INT(11)'
				execute 'ALTER TABLE feeds ALTER COLUMN pshb SET DEFAULT 1'
			end

			execute 'UPDATE feeds SET pshb=1 WHERE pshb=0'
			execute 'UPDATE feeds SET pshb=2 WHERE pshb=1'
		end
	end
end

migrate_up!
