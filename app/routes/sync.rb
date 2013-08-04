# encoding: utf-8
# Sync

# All users sync
post '/full_sync' do
	authorize_basic! :sync
	content_type :json, 'charset' => 'utf-8'

	urls = Feed.all.map{ |feed| feed.url }
	urls.uniq!

	feeds = Feedzirra::Feed.fetch_and_parse(urls, {:max_redirects => 3, :timeout => 30})

	updated_count = 0
	new_items = 0
	errors = 0
	feeds.each do |url, xml|
		if xml.kind_of?(Fixnum)
			errors+=1
			next
		end

		Feed.all(:url => url).each do |feed|
			old_count = feed.items.count

			feed.update_feed!(xml)
			updated_count+=1

			new_items += feed.items.count - old_count
		end
	end

	if new_items > 0
		send_streams "sync:new_items"
	end

	{ :updated => updated_count, :new_items => new_items, :errors => errors }.to_json
end

# Single user sync
namespace '/sync' do
	before do
		authorize_basic! :user
		content_type :json, 'charset' => 'utf-8'
	end

	post '/all' do
		urls = Feed.all(:user => @user).map{ |feed| feed.url }
		urls.uniq!

		feeds = Feedzirra::Feed.fetch_and_parse(urls, {:max_redirects => 3, :timeout => 30})

		updated_count = 0
		new_items = 0
		errors = 0
		feeds.each do |url, xml|
			if xml.kind_of?(Fixnum)
				errors+=1
				next
			end

			Feed.all(:user => @user, :url => url).each do |feed|
				old_count = feed.items.count

				feed.update_feed!(xml)

				updated_count+=1
				new_items += feed.items.count - old_count
			end
		end
		{ :updated => updated_count, :new_items => new_items, :errors => errors }.to_json
	end

	post '/folder/:id' do |id|
		folder = Folder.first(:user => @user, :id => id)

		urls = folder.feeds.map{ |feed| feed.url }
		urls.uniq!

		feeds = Feedzirra::Feed.fetch_and_parse(urls, {:max_redirects => 3, :timeout => 30})

		updated_count = 0
		new_items = 0
		errors = 0
		feeds.each do |url, xml|
			if xml.kind_of?(Fixnum)
				errors+=1
				next
			end

			folder.feeds.all(:user => @user, :url => url).each do |feed|
				old_count = feed.items.count

				feed.update_feed!(xml)

				updated_count+=1
				new_items += feed.items.count - old_count
			end
		end
		{ :updated => updated_count, :new_items => new_items, :errors => errors }.to_json
	end

	post '/feed/:id' do |id|
		feed = Feed.first(:user => @user, :id => id)
		old_count = feed.items.count

		feed.sync!

		new_items = feed.items.count - old_count
		{ :updated => 1, :new_items => new_items }.to_json
	end
end
