# encoding: utf-8
# Feeds

before '/feed*' do
	authorize_basic! :user
end

get '/feed' do
	Feed.all(:user => @user).to_json
end

get '/feed/:id', '/folder/*/feed/:id' do
	Feed.first(:user => @user, :id => params[:id]).to_json
end

get '/feed/:id/item' do |id|
	options = {
		:order => [:date.desc],
		:offset => params[:offset].to_i || 0,
		:limit => params[:limit].to_i || nil
	}
	options[:read] = false if params[:show_read] == 'false'
	Feed.first(:user => @user, :id => id).items(options).to_json
end

# Subscription
post '/feed' do
	authorize_basic! :user

	params[:folder] = 'Feeds' if params[:folder].empty?
	folder = Folder.first_or_create(:user => @user, :title => params[:folder])
	feed = Feed.new(
		:user => @user,
		:title => params[:url],
		:url => params[:url],
		:last_update => DateTime.new(2000,1,1)
	)
	folder.feeds << feed
	folder.save

	feed.sync!

	return 'done'
end

post '/reset/feed/:id' do
	authorize_basic! :user

	feed = Feed.first(:user => @user, :id => params[:id])
	feed.items.destroy
	feed.last_update = DateTime.new(2000,1,1)
	feed.save

	feed.sync!

	return 'done'
end

put '/feed/:id', '/folder/*/feed/:id' do
	attributes = JSON.parse(request.body.string, :symbolize_names => true)

	# Convert the folder name into a folder_id
	if attributes.has_key?(:folder)
		folder = Folder.first_or_create(:user => @user, :title => attributes[:folder])
		folder.save
		attributes.delete(:folder_id)
		attributes.delete(:folder)
		attributes[:folder_id] = folder.id
	end

	feed = Feed.first(:user => @user, :id => params[:id])
	old_folder = feed.folder
	feed.attributes = attributes
	feed.save

	feed.update_unread_count!
	old_folder.update_unread_count!

	feed.to_json
end

# Mark all items in this feed as "read"
put '/read/feed/:id' do |id|
	authorize_basic! :user

	feed = Feed.first(:user => @user, :id => id)
	feed.items.each do |item|
		item.read = true
	end
	feed.unread_count = 0
	feed.save
	feed.folder.update_unread_count!

	feed.to_json
end

# Mark all items in this feed as "unread"
put '/unread/feed/:id' do |id|
	authorize_basic! :user

	feed = Feed.first(:user => @user, :id => id)
	feed.items.each do |item|
		item.read = false
	end
	feed.save
	feed.update_unread_count!

	feed.to_json
end

delete '/feed/:id', '/folder/*/feed/:id' do
	feed = Feed.first(:user => @user, :id => params[:id])
	old_folder = feed.folder
	feed.destroy
	old_folder.update_unread_count!

	return '{}'
end
