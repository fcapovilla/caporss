# encoding: utf-8
# Sync

# All users sync
post '/full_sync' do
	authorize_basic! :sync
	content_type :json, 'charset' => 'utf-8'

	Feed.all(:pshb => true).each do |feed|
		# Resubscribe if the Pubsubhubbub subscription is almost expired
		if feed.pshb_expiration and feed.pshb_expiration < Time.now + (60*60*2)
			feed.pshb_subscribe!(uri('/pshb/callback'))
		end
	end

	urls = Feed.all(:pshb => false).map{ |feed| feed.url }
	urls.uniq!

	feeds = Feedzirra::Feed.fetch_and_parse(urls, {:max_redirects => 3, :timeout => 30})

	updated_count = 0
	new_items = 0
	errors = 0
	feeds.each do |url, xml|
		Feed.all(:url => url, :pshb => false).each do |feed|
			if xml.kind_of?(Fixnum)
				errors+=1

				feed.sync_error = xml
				feed.save
			else
				old_count = feed.items.count

				feed.update_feed!(xml)
				updated_count+=1

				new_items += feed.items.count - old_count
			end
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

		Feed.all(:pshb => true).each do |feed|
			# Resubscribe if the Pubsubhubbub subscription is almost expired
			if feed.pshb_expiration and feed.pshb_expiration < Time.now + (60*60*2)
				feed.pshb_subscribe!(uri('/pshb/callback'))
			end
		end
	end

	post '/all' do
		urls = Feed.all(:user => @user, :pshb => false).map{ |feed| feed.url }
		urls.uniq!

		feeds = Feedzirra::Feed.fetch_and_parse(urls, {:max_redirects => 3, :timeout => 30})

		updated_count = 0
		new_items = 0
		errors = 0
		feeds.each do |url, xml|
			Feed.all(:user => @user, :url => url, :pshb => false).each do |feed|
				if xml.kind_of?(Fixnum)
					errors+=1

					feed.sync_error = xml
					feed.save
				else
					old_count = feed.items.count

					feed.update_feed!(xml)

					updated_count+=1
					new_items += feed.items.count - old_count
				end
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
			folder.feeds.all(:user => @user, :url => url).each do |feed|
				if xml.kind_of?(Fixnum)
					errors+=1

					feed.sync_error = xml
					feed.save
				else
					old_count = feed.items.count

					feed.update_feed!(xml)

					updated_count+=1
					new_items += feed.items.count - old_count
				end
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
