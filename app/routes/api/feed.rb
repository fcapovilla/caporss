# encoding: utf-8
# Feeds

before '/api/feed*' do
	authorize_basic! :user
	content_type :json, 'charset' => 'utf-8'
end

get '/api/feed' do
	Feed.all(:user => @user).to_json
end

get '/api/feed/:id', '/api/folder/*/feed/:id' do
	Feed.first(:user => @user, :id => params[:id]).to_json
end

get '/api/feed/:id/item' do |id|
	options = prepare_item_search(params)
	Feed.first(:user => @user, :id => id).items(options).to_json
end

post '/api/feed' do
	params[:folder] = 'Feeds' if params[:folder].nil? or params[:folder].empty?
	folder = Folder.first_or_create(:user => @user, :title => params[:folder])

	feed = Feed.new(
		:user => @user,
		:title => params[:url][0..99],
		:url => params[:url]
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

put '/api/feed/:id', '/api/folder/*/feed/:id' do
	feed = Feed.first(:user => @user, :id => params[:id])
	attributes = JSON.parse(request.body.read, :symbolize_names => true)
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

	# Manage position change
	old_folder = nil
	if attributes.has_key?(:folder_id) and attributes[:folder_id] != feed.folder_id
		# Keep the old folder if the feed's folder changed
		old_folder = feed.folder

		if attributes.has_key?(:position)
			feed.move_to_list(attributes[:folder_id], attributes[:position])
		else
			feed.move_to_list(attributes[:folder_id])
		end
	else
		feed.move(attributes[:position]) if attributes.has_key?(:position)
	end

	if attributes.has_key?(:pshb)
		if feed.pshb != :inactive and attributes[:pshb] == 'inactive'
			feed.pshb_unsubscribe!(uri('pshb/callback'))
		elsif feed.pshb == :inactive and attributes[:pshb] != 'inactive'
			feed.pshb_subscribe!(uri('/pshb/callback'))
		end
	end

	feed.attributes = attributes.slice(:url)

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

delete '/api/feed/:id', '/api/folder/*/feed/:id' do
	feed = Feed.first(:user => @user, :id => params[:id])
	old_folder = feed.folder
	feed.destroy
	old_folder.update_unread_count!

	return '{}'
end
