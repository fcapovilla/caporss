# encoding: utf-8
# Pubsubhubbub callback

# Subscription verification
get '/pshb/callback' do
	params['hub.challenge']
end

post '/pshb/callback' do
	puts request.body.string

	entries = Feedzirra::Feed.parse(request.body.string)
	feed = Feed.first(:url => entries.topic)

	if feed
		feed.update_feed!(entries)
		return 200
	else
		return 404
	end
end
