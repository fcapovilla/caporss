# encoding: utf-8
# Sync

# All users sync
post '/full_sync' do
	authorize_basic! :sync
	content_type :json, 'charset' => 'utf-8'

	last_sync = DateTime.now
	urls = Feed.all(:pshb.not => :active).map{ |feed|
		if feed.last_sync < last_sync
			last_sync = feed.last_sync
		end
		feed.url
	}
	urls.uniq!

	feeds = Feedjira::Feed.fetch_and_parse(urls, {:max_redirects => 3, :timeout => 30, :if_modified_since => last_sync})

	updated_count = 0
	new_items = 0
	errors = 0
	feeds.each do |url, xml|
		Feed.all(:url => url, :pshb.not => :active).each do |feed|
			if xml.kind_of?(Fixnum)
				errors+=1

				feed.sync_error = xml
				feed.last_sync = DateTime.now
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

	Feed.all(:pshb => :active).each do |feed|
		# Resubscribe if the Pubsubhubbub subscription is almost expired
		if feed.pshb_expiration and feed.pshb_expiration < Time.now + (60*60*2)
			feed.pshb_subscribe!(uri('/pshb/callback'))
		end
	end

	{ :updated => updated_count, :new_items => new_items, :errors => errors }.to_json
end

# Single user sync
namespace '/sync' do
	before do
		authorize_basic! :user
		content_type :json, 'charset' => 'utf-8'
	end

	after do
		Feed.all(:pshb => :active).each do |feed|
			# Resubscribe if the Pubsubhubbub subscription is almost expired
			if feed.pshb_expiration and feed.pshb_expiration < Time.now + (60*60*2)
				feed.pshb_subscribe!(uri('/pshb/callback'))
			end
		end
	end

	post '/all' do
		user_id = @user.id
		last_sync = DateTime.now

		updated_count = 0
		new_items = 0
		errors = 0

		filters = {:user => @user}
		filters[:pshb.not] = :active unless params[:force]

		urls = Feed.all(filters).map{ |feed|
			if feed.last_sync < last_sync
				last_sync = feed.last_sync
			end
			feed.url
		}
		urls.uniq!

		thread = Thread.new do
			feeds = Feedjira::Feed.fetch_and_parse(urls, {:max_redirects => 3, :timeout => 30, :if_modified_since => last_sync})

			feeds.each do |url, xml|
				Feed.all(filters.merge(:url => url)).each do |feed|
					if xml.kind_of?(Fixnum)
						errors+=1

						feed.sync_error = xml
						feed.last_sync = DateTime.now
						feed.save
					else
						old_count = feed.items.count

						feed.update_feed!(xml)

						updated_count+=1
						new_items += feed.items.count - old_count
					end
				end
			end

			if params[:async]
				if new_items > 0
					send_streams('sync:new_items', '', user_id)
				end
				send_streams('sync:finished', '', user_id)
			end
		end

		if params[:async]
			{ :async => true }.to_json
		else
			thread.join
			{ :updated => updated_count, :new_items => new_items, :errors => errors }.to_json
		end
	end

	post '/folder/:id' do |id|
		folder = Folder.first(:user => @user, :id => id)

		last_sync = DateTime.now

		filters = {:user => @user}
		filters[:pshb.not] = :active unless params[:force]

		urls = folder.feeds.all(filters).map{ |feed|
			if feed.last_sync < last_sync
				last_sync = feed.last_sync
			end
			feed.url
		}
		urls.uniq!

		feeds = Feedjira::Feed.fetch_and_parse(urls, {:max_redirects => 3, :timeout => 30, :if_modified_since => last_sync})

		updated_count = 0
		new_items = 0
		errors = 0
		feeds.each do |url, xml|
			folder.feeds.all(filters.merge(:url => url)).each do |feed|
				if xml.kind_of?(Fixnum)
					errors+=1

					feed.sync_error = xml
					feed.last_sync = DateTime.now
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
