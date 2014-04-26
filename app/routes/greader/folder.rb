# encoding: utf-8
# GReader Tags (Folders)

namespace '/greader' do
	namespace '/reader/api/0' do

		before do
			authorize_token! :user
		end

		get '/tag/list' do
			tags = []

			Folder.all(:user => @user).each do |folder|
				tags << {
					:id => "user/#{@user.id}/label/#{folder.title}",
					:sortid => folder.position
				}
			end

			{:tags => tags}.to_json
		end

		get '/preference/stream/list' do
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

		get '/unread-count' do
			counts = []
			total = 0
			newest_item = '0'

			counts += Folder.all(:user => @user).map do |folder|
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

			counts += Feed.all(:user => @user).map do |feed|
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

route :get, :post, '/greader/reader/api/0/rename-tag' do
	authorize_token! :user

	if params[:s] and params[:s] =~ /^user\/[^\/]*\/label\/(.*)/
		if folder = Folder.first(:title => $1, :user => @user)
			if params[:dest] =~ /^user\/[^\/]*\/label\/(.+)/
				folder.title = $1
				folder.save
			end
		end
	end

	'OK'
end

route :get, :post, '/greader/reader/api/0/disable-tag' do
	authorize_token! :user

	if params[:s] and params[:s] =~ /^user\/[^\/]*\/label\/(.*)/
		if folder = Folder.first(:title => $1, :user => @user)
			base_folder = Folder.first_or_create(:user => @user, :title => 'Feeds')

			feed_ids = folder.feeds.map { |feed| feed.id }
			feed_ids.each do |feed_id|
				feed = Feed.get(feed_id)
				feed.move_to_list(base_folder.id)
			end

			folder.reload.destroy
		end
	end

	'OK'
end


route :get, :post, '/greader/reader/api/0/preference/stream/set' do
	authorize_token! :user

	folder = nil
	if params[:s] and params[:s] =~ /^user\/[^\/]*\/label\/(.*)/
		folder = Folder.first(:title => $1, :user => @user)
	end

	if folder and params[:k]
		if params[:k] == 'is-expanded'
			folder.update(:open => (params[:v] == 'true'))
		end
	end

	'OK'
end
