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

post '/feed' do
	params[:folder] = 'Feeds' if params[:folder].empty?
	folder = Folder.first_or_create(:user => @user, :title => params[:folder])

	feed = Feed.new(
		:user => @user,
		:title => params[:url],
		:url => params[:url],
	)
	folder.feeds << feed

	unless feed.valid?
		errors = feed.errors.map{|e| e.first.to_s}
		return 400, errors.to_json
	end

	folder.save
	feed.sync!

	feed.to_json
end

put '/feed/:id', '/folder/*/feed/:id' do
	feed = Feed.first(:user => @user, :id => params[:id])
	attributes = JSON.parse(request.body.string, :symbolize_names => true)
	action = attributes.delete(:action)

	# Convert the folder name into a folder_id
	if attributes.has_key?(:folder)
		attributes[:folder] = 'Feeds' if attributes[:folder].empty?

		folder = Folder.first_or_create(:user => @user, :title => attributes[:folder])
		folder.save
		attributes.delete(:folder_id)
		attributes.delete(:folder)
		attributes[:folder_id] = folder.id
	end

	# Keep the old folder if the feed's folder changed
	old_folder = nil
	if feed.folder_id != attributes[:folder_id]
		old_folder = feed.folder
	end

	feed.attributes = attributes.slice(:folder_id, :url)

	unless feed.valid?
		errors = feed.errors.map{|e| e.first.to_s}
		return 400, errors.to_json
	end

	case action
	when 'read'
		feed.items.each do |item|
			item.read = true
		end
		feed.save
	when 'unread'
		feed.items.each do |item|
			item.read = false
		end
		feed.save
	when 'reset'
		feed.reset!
	end

	feed.update_unread_count!
	old_folder.update_unread_count! if old_folder

	feed.to_json
end

delete '/feed/:id', '/folder/*/feed/:id' do
	feed = Feed.first(:user => @user, :id => params[:id])
	old_folder = feed.folder
	feed.destroy
	old_folder.update_unread_count!

	return '{}'
end
