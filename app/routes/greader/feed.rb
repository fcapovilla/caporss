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
		end

		get '/subscription/quickadd' do
		end

		get '/subscription/edit' do
		end

		get '/mark-all-as-read' do
		end
	end
end
