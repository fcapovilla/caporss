# encoding: utf-8
# GReader Subscriptions (Feeds)

get '/greader/reader/api/0/subscription/list' do
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

route :get, :post, '/greader/reader/api/0/subscription/quickadd' do
	authorize_token! :user

	folder = Folder.first_or_create(:user => @user, :title => 'Feeds')

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

route :get, :post, '/greader/reader/api/0/subscription/edit' do
	authorize_token! :user

	return 404 unless params[:ac]

	feed = nil
	if params[:s] and params[:s] =~ /^feed\/(.*)/
		feed = Feed.first(:url => $1, :user => @user)
	end

	if params[:ac] == 'unsubscribe' and feed
		old_folder = feed.folder
		feed.destroy
		old_folder.update_unread_count!
	end

	if params[:ac] == 'subscribe'
		if params[:s] and params[:s] =~ /^feed\/(.+)/
			feed = Feed.new(
				:user => @user,
				:title => $1[0..99],
				:url => $1
			)
		end
	end

	if (params[:ac] == 'edit' or params[:ac] == 'subscribe') and feed
		old_folder = feed.folder

		if params[:r] and params[:r] =~ /^user\/[^\/]*\/label\/(.*)/
			folder = Folder.first(:title => $1, :user => @user)
			if folder == old_folder
				feed.folder = nil
			end
		end

		if params[:a] and params[:a] =~ /^user\/[^\/]*\/label\/(.*)/
			feed.folder = Folder.first_or_create(:title => $1, :user => @user)
		end

		feed.title = params[:t] if params[:t]

		if feed.folder.nil?
			feed.folder = Folder.first_or_create(:user => @user, :title => 'Feeds')
		end

		unless feed.folder == old_folder
			feed.save
			feed.move(:bottom)
			feed.folder.update_unread_count!
			old_folder.reload.update_unread_count! unless old_folder.nil?
			Folder.repair_list
		else
			feed.save
		end

		feed.sync! if params[:ac] == 'subscribe'
	end

	'OK'
end

route :get, :post, '/greader/reader/api/0/mark-all-as-read' do
	authorize_token! :user

	if params[:s]
		if params[:s] =~ /^feed\/(.*)/
			feed = Feed.first(:url => $1, :user => @user)
			feed.items.each do |item|
				item.read = true
			end
			feed.save
			feed.update_unread_count!
		elsif params[:s] =~ /^user\/[^\/]*\/label\/(.*)/
			folder = Folder.first(:title => $1, :user => @user)
			folder.feeds.each do |f|
				f.items.each do |item|
					item.read = true
				end
				f.save
				f.update_unread_count!
			end
		end
	end

	'OK'
end
