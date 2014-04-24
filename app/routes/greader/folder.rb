# encoding: utf-8
# GReader Tags (Folders)

namespace '/greader' do
	namespace '/reader/api/0' do
		get '/tag/list' do
			authorize_token! :user

			tags = []

			Folder.all(:user => @user).each do |folder|
				tags << {
					:id => "user/#{@user.id}/label/#{folder.title}",
					:sortid => folder.position
				}
			end

			{:tags => tags}.to_json
		end

		get '/rename-tag' do
			{}.to_json # TODO
		end

		get '/disable-tag' do
			{}.to_json # TODO
		end

		get '/edit-tag' do
			{}.to_json # TODO
		end

		get '/preference/stream/list' do
			authorize_token! :user

			prefs = {}

			Folder.all(:user => @user).each do |folder|
				prefs["user/#{@user.id}/label/#{folder.title}"] = [
					{
						:id => 'is-expanded',
						:value => folder.open ? 'true' : 'false'
					},
					{
						:id => 'subscription-ordering',
						:value => folder.id.to_s
					}
				]
			end

			{:streamprefs => prefs}.to_json
		end

		get '/preference/stream/set' do
			authorize_token! :user

			folder = Folder.first(params[:s].to_i)

			if folder and params[:k]
				if params[:k] == 'is-expanded'
					folder.update(:open => (params[:v] == 'true'))
				end
			end

			'OK'
		end

		get 'unread-count' do
			authorize_token! :user

			counts = []
			total = 0
			newest_item = '0'

			counts += Folder.all.map do |folder|
				newest = '0'
				if feed = folder.feeds.first(:order => [:last_update.desc])
					newest = (feed.last_update.to_time.to_i * 1000 * 1000).to_s
				end

				newest_item = newest if newest.to_i > newest_item.to_i

				total += folder.unread_count

				{
					:id => "user/#{@user.id}/label/#{folder.title}",
					:count => folder.unread_count,
					:newestItemTimestampUsec => newest
				}
			end

			counts += Feed.all.map do |feed|
				{
					:id => "feed/#{feed.url}",
					:count => feed.unread_count,
					:newestItemTimestampUsec => (feed.last_update.to_time.to_i * 1000 * 1000).to_s
				}
			end

			counts += [{
				:id => "user/#{@user.id}/state/com.google/reading-list",
				:count => total,
				:newestItemTimestampUsec => newest_item
			}]

			{
				:max => total,
				:unreadcounts => counts
			}.to_json
		end
	end
end
