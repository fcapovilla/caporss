# encoding: utf-8
# Sync

# All users sync
post '/full_sync' do
	authorize_basic! :sync

	urls = Feed.all.map{ |feed| feed.url }
	urls.uniq!
	feeds = Feedzirra::Feed.fetch_and_parse(urls)
	updated_count = 0
	new_items = 0
	feeds.each do |url, xml|
		next if xml.kind_of?(Fixnum)
		Feed.all(:url => url).each_with_index do |feed, i|
			old_count = feed.items.count if i==0

			feed.update_feed!(xml)
			updated_count+=1

			new_items += feed.items.count - old_count if i==0
		end
	end
	{ :updated => updated_count, :new_items => new_items }.to_json
end

# Single user sync
namespace '/sync' do
	before do
		authorize_basic! :user
	end

	post '/all' do
		urls = Feed.all(:user => @user).map{ |feed| feed.url }
		feeds = Feedzirra::Feed.fetch_and_parse(urls)
		updated_count = 0
		new_items = 0
		feeds.each do |url, xml|
			next if xml.kind_of?(Fixnum)
			feed = Feed.first(:user => @user, :url => url)
			old_count = feed.items.count

			feed.update_feed!(xml) if feed

			updated_count+=1
			new_items += feed.items.count - old_count
		end
		{ :updated => updated_count, :new_items => new_items }.to_json
	end

	post '/folder/:id' do |id|
		urls = Folder.first(:user => @user, :id => id).feeds.map{ |feed| feed.url }
		feeds = Feedzirra::Feed.fetch_and_parse(urls)
		updated_count = 0
		new_items = 0
		feeds.each do |url, xml|
			next if xml.kind_of?(Fixnum)
			feed = Feed.first(:user => @user, :url => url)
			old_count = feed.items.count

			feed.update_feed!(xml) if feed

			updated_count+=1
			new_items += feed.items.count - old_count
		end
		{ :updated => updated_count, :new_items => new_items }.to_json
	end

	post '/feed/:id' do |id|
		feed = Feed.first(:user => @user, :id => id)
		old_count = feed.items.count

		feed.sync!

		new_items = feed.items.count - old_count
		{ :updated => 1, :new_items => new_items }.to_json
	end
end
