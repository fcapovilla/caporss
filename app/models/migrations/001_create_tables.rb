# encoding: utf-8
#
Sequel.migration do
	change do
		create_table(:favicons) do
			primary_key :id

			String :url, :size => 2000
			String :data, :text => true
		end

		create_table(:feeds) do
			primary_key :id
			foreign_key :user_id, :users
			foreign_key :folder_id, :folders
			foreign_key :favicon_id, :favicons

			String :title, :size => 100
			String :url, :size => 2000
			DateTime :last_update, :default => DateTime.new(2000,1,1)
			DateTime :last_sync, :default => DateTime.new(2000,1,1)
			Integer :unread_count, :default => 0
			Integer :sync_error, :default => 0
			String :pshb_hub, :size => 2000, :default => ''
			String :pshb_topic, :size => 2000, :default => ''
			Time :pshb_expiration
			Integer :pshb, :default => 0
			Integer :position
		end

		create_table(:folders) do
			primary_key :id
			foreign_key :user_id, :users

			String :title, :size => 200
			Boolean :open, :default => true
			Integer :unread_count, :default => 0
			Integer :position
		end

		create_table(:items) do
			primary_key :id
			foreign_key :user_id, :users
			foreign_key :feed_id, :feeds

			String :title, :size => 200
			String :url, :size => 2000
			String :guid, :size => 2000
			String :content, :text => true
			String :attachment_url, :size => 2000
			String :medias, :text => true
			Boolean :read, :default => false
			Boolean :favorite, :default => false
			DateTime :date
			String :orig_feed_title, :size => 100
		end

		create_table(:settings) do
			primary_key :id
			String :name
			String :value, :size => 200
		end

		create_table(:users) do
			primary_key :id

			String :username, :size => 100
			String :password_digest
			String :role, :default => 'user'
			Integer :cleanup_after, :default => 300
			Integer :refresh_timeout, :default => 10
			Boolean :sse_refresh, :default => false
			Boolean :desktop_notifications, :default => true
			Integer :sync_timeout, :default => 0
			String :default_locale, :size => 5, :default => 'en'
			Integer :items_per_page, :default => 50
		end
	end
end
