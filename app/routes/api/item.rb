# encoding: utf-8
# Items

before '/api/item*' do
	authorize_basic! :user
	content_type :json, 'charset' => 'utf-8'
end

get '/api/item/stats' do
	{
		:total_favicons => Favicon.count,
		:total_folders => Folder.count,
		:total_feeds => Feed.count,
		:total_items => Item.count,
		:unread_items => Item.count(:read => false),
	}.to_json
end

get '/api/item' do
	options = prepare_item_search(params)
	Item.all(options).to_json
end

get '/api/item/:id', '/api/feed/*/item/:id', '/api/folder/*/item/:id' do
	Item.first(:user => @user, :id => params[:id]).to_json
end

#post '/item' do

put '/api/item/:id', '/api/feed/*/item/:id', '/api/folder/*/item/:id' do
	item = Item.first(:user => @user, :id => params[:id])
	attributes = JSON.parse(request.body.read, :symbolize_names => true)
	action = attributes.delete(:action)

	item.attributes = attributes.slice(:read, :favorite)

	unless item.save
		errors = item.errors.map{|e| e.first.to_s}
		return 400, errors.to_json
	end

	case action
	when 'read_older'
		item.feed.items.all(:date.lt => item.date).update(:read => true)
	when 'read_newer'
		item.feed.items.all(:date.gt => item.date).update(:read => true)
	when 'unread_older'
		item.feed.items.all(:date.lt => item.date).update(:read => false)
	when 'unread_newer'
		item.feed.items.all(:date.gt => item.date).update(:read => false)
	end

	# Delete item if it isn't linked to a feed and isn't a favorite
	if item.feed.nil? and item.favorite == false
		item.destroy
		return '{}'
	else
		item.feed.update_unread_count!
		item.to_json
	end
end

delete '/api/item/:id', '/api/feed/*/item/:id', '/api/folder/*/item/:id' do
	# Items cannot be deleted client-side. Do nothing.
	return '{}'
end
