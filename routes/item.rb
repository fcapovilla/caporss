# encoding: utf-8
# Items

before '/item*' do
	authorize_basic! :user
end

get '/item' do
	options = {
		:user => @user,
		:order => [:date.desc],
		:offset => params[:offset].to_i || 0,
		:limit => params[:limit].to_i || nil
	}
	options[:read] = false if params[:show_read] == 'false'
	Item.all(options).to_json
end

get '/item/:id', '/feed/*/item/:id', '/folder/*/item/:id' do
	Item.first(:user => @user, :id => params[:id]).to_json
end

#post '/item' do

put '/item/:id', '/feed/*/item/:id', '/folder/*/item/:id' do
	item = Item.first(:user => @user, :id => params[:id])
	item.attributes = JSON.parse(request.body.string, :symbolize_names => true)
	item.save
	item.feed.update_unread_count!
	item.to_json
end

#delete '/item/:id' do |id|
