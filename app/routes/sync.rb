# encoding: utf-8
# Sync

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

		updated_count = 0
		new_items = 0
		errors = 0

		filters = {:user => @user}
		filters[:pshb.not] = :active unless params[:force]

		thread = Thread.new do
			Feed.all(filters).each do |feed|
				old_count = feed.items.count

				feed.sync!

				updated_count+=1
				new_items += feed.items.count - old_count

				if feed.sync_error
					errors+=1
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

		updated_count = 0
		new_items = 0
		errors = 0

		filters = {:user => @user}
		filters[:pshb.not] = :active unless params[:force]

		folder.feeds.all(filters).each do |feed|
			old_count = feed.items.count

			feed.sync!

			updated_count+=1
			new_items += feed.items.count - old_count

			if feed.sync_error
				errors+=1
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
