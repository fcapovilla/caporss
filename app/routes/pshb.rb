# encoding: utf-8
# Pubsubhubbub callback

# Subscription verification
get '/pshb/callback/:id' do
	feed = Feed.get(params[:id])

	if params['hub.mode'] == 'subscribe'
		if feed and feed.pshb and feed.pshb_topic == params['hub.topic']
			feed.pshb_expiration = Time.now + params['hub.lease_seconds'].to_i
			feed.save
			return params['hub.challenge']
		end
	elsif params['hub.mode'] == 'unsubscribe'
		if feed and !feed.pshb and feed.pshb_topic == params['hub.topic']
			feed.pshb_expiration = nil
			feed.save
			return params['hub.challenge']
		end
	end

	404
end

post '/pshb/callback/:id' do
	id = params[:id]

	# Parse and update the feed in the background
	Thread.new do
		entries = Feedjira::Feed.parse(request.body.read)
		feed = Feed.get(id)

		if feed and feed.pshb
			old_count = feed.items.count

			feed.update_feed!(entries)

			if feed.items.count > old_count
				send_streams "sync:feed_updated", {:folder_id => feed.folder_id, :feed_id => feed.id}
			end
		else
			logger.error "Pubsubhubbub feed update failed for feed #{id}"
		end
	end

	200
end
