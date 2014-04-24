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
				htmlUrl = URI.parse(feed.url)
				htmlUrl.path = '/'
				htmlUrl.query = nil
				htmlUrl.fragment = nil

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
					:htmlUrl => htmlUrl,
					:iconUrl => feed.favicon ? feed.favicon.url : '' # FIXME: This url might be wrong
				}
			end

			{:subscriptions => subscriptions}.to_json
		end

		get '/subscription/quickadd' do
			authorize_token! :user

			folder = Folder.first_or_create(:user => @user, :title => 'Feed')

			feed = Feed.new(
				:user => @user,
				:title => params[:quickadd][0..99],
				:url => params[:quickadd]
			)
			folder.feeds << feed

			numResults = 0
			if feed.valid?
				numResults = 1
				folder.save
				feed.sync!
			end

			{
				:query => feed.url,
				:numResults => numResults,
				:streamId => "feed/#{feed.url}"
			}.to_json
		end

		get '/subscription/edit' do
			authorize_token! :user

			return 404 unless params[:ac]

			feed = nil
			if params[:s] and params[:s] =~ /^feed\/(.*)/
				feed = Feed.first(:url => $1, :user => @user)
			end

			folder_a = nil
			if params[:a] and params[:a] =~ /^label\/(.*)/
				folder_a = Folder.first(:title => $1, :user => @user)
			end

			folder_r = nil
			if params[:r] and params[:r] =~ /^label\/(.*)/
				folder_r = Folder.first(:title => $1, :user => @user)
			end

			if params[:ac] == 'unsubscribe' and feed
				old_folder = feed.folder
				feed.destroy
				old_folder.update_unread_count!
			end

			if (params[:ac] == 'edit' or params[:ac] == 'subscribe') and feed
				old_folder = feed.folder

				if folder_r == old_folder
					folder = Folder.first_or_create(:user => @user, :title => 'Feed')
					feed.folder = folder
				end

				if folder_a
					feed.folder = folder_a
				end

				feed.title = params[:t] if params[:t]

				feed.save
				feed.folder.update_unread_count!
				old_folder.update_unread_count!
			end

			'OK'
		end

		get '/mark-all-as-read' do
			authorize_token! :user

			if params[:s]
				if params[:s] =~ /^feed\/(.*)/
					feed = Feed.first(:url => $1, :user => @user)
					feed.items.each do |item|
						item.read = true
					end
					feed.save
					feed.update_unread_count!
				elsif params[:s] =~ /^label\/(.*)/
					folder = Folder.first(:title => $1, :user => @user)
					folder.feeds.each do |f|
						f.items.each do |item|
							item.read = true
						end
						f.save
					end
					folder.update_unread_count!
				end
			end

			'OK'
		end

	end
end
