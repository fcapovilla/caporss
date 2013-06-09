# encoding: utf-8
# Items

before '/item*' do
	authorize_basic! :user
	content_type :json, 'charset' => 'utf-8'
end

get '/item' do
	options = prepare_item_search(params)
	Item.all(options).to_json
end

get '/item/:id', '/feed/*/item/:id', '/folder/*/item/:id' do
	Item.first(:user => @user, :id => params[:id]).to_json
end

#post '/item' do

put '/item/:id', '/feed/*/item/:id', '/folder/*/item/:id' do
	item = Item.first(:user => @user, :id => params[:id])
	attributes = JSON.parse(request.body.string, :symbolize_names => true)

	item.attributes = attributes.slice(:read)

	unless item.save
		errors = item.errors.map{|e| e.first.to_s}
		return 400, errors.to_json
	end

	item.feed.update_unread_count!
	item.to_json
end

#delete '/item/:id' do |id|
