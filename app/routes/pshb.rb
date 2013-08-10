# encoding: utf-8
# Pubsubhubbub callback

# Subscription verification
get '/pshb/callback' do
	params['hub.challenge']
end

post '/pshb/callback' do
	logger.info request.body.string

	# Parse and update the feed in the backbround
	task = Thread.new do
		entries = Feedzirra::Feed.parse(request.body.string)
		feed = Feed.first(:url => entries.topic)

		if feed
			feed.update_feed!(entries)
		else
			logger.error "Pubsubhubbub feed update failed for feed #{entries.topic}"
		end
	end

	200
end
