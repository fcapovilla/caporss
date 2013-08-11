# encoding: utf-8
# Pubsubhubbub callback

# Subscription verification
get '/pshb/callback/:id' do
	feed = Feed.get(params[:id])

	if feed.pshb_topic != params['hub.topic']
		return 404
	else
		if params['hub.mode'] == 'subscribe'
			feed.pshb_expiration = Time.now + params['hub.lease_seconds'].to_i
			feed.save
		end

		return params['hub.challenge']
	end
end

post '/pshb/callback/:id' do
	logger.info request.body.string

	# Parse and update the feed in the backbround
	task = Thread.new do
		entries = Feedzirra::Feed.parse(request.body.string)
		feed = Feed.get(params[:id])

		if feed
			old_count = feed.items.count

			feed.update_feed!(entries)

			if feed.items.count > old_count
				send_streams "sync:new_items"
			end
		else
			logger.error "Pubsubhubbub feed update failed for feed #{entries.topic}"
		end
	end

	200
end