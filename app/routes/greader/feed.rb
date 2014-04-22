# encoding: utf-8
# GReader Subscriptions (Feeds)

namespace '/greader' do
	namespace '/reader/api/0' do
		get '/unread-count' do
			authorize_token! :user

			unread_counts = []

			Feed.all(:user => @user).each do |feed|
				unread_counts << {
					:id => "feed/#{feed.url}",
					:count => feed.unread_count,
					:newestItemTimestampUsec => feed.last_update.to_time.to_i * 1000
				}
			end

			{:max => 1000, :unreadcounts => unread_counts}.to_json
		end

		get '/subscription/list' do
			authorize_token! :user

			subscriptions = []

			Feed.all(:user => @user).each do |feed|
				subscriptions << {
					:id => "feed/#{feed.url}",
					:title => feed.title,
					:categories => [{
						:id => "user/#{@user.id}/label/#{feed.folder.title}",
						:label => feed.folder.title
					}],
					:sortid => feed.position,
					:firstitemmsec => feed.last_update.to_time.to_i * 1000,
					:url => feed.url,
					:htmlUrl => feed.url, # FIXME: hostname only
					:iconUrl => feed.favicon ? feed.favicon.url : '' # FIXME: Get local url
				}
			end

			{:subscriptions => subscriptions}.to_json
		end

		get '/subscription/quickadd' do
			{}.to_json # TODO
		end

		get '/subscription/edit' do
			{}.to_json # TODO
		end

		get '/mark-all-as-read' do
			{}.to_json # TODO
		end
	end
end
