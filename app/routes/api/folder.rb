# encoding: utf-8
# Folders

before '/api/folder*' do
	authorize_basic! :user
	content_type :json, 'charset' => 'utf-8'
end

get '/api/folder' do
	Folder.all(:user => @user, :order => :position.asc).to_json
end

get '/api/folder/:id' do |id|
	Folder.first(:user => @user, :id => id).to_json
end

get '/api/folder/:id/feed' do |id|
	Folder.first(:user => @user, :id => id).feeds(:order => :position.asc).to_json
end

get '/api/folder/:id/item' do |id|
	options = prepare_item_search(params)
	Folder.first(:user => @user, :id => id).feeds.items(options).to_json
end

# post '/folder' do

put '/api/folder/:id' do |id|
	folder = Folder.first(:user => @user, :id => id)
	attributes = JSON.parse(request.body.string, :symbolize_names => true)

	folder.move(attributes[:position]) if attributes.has_key?(:position)

	folder.attributes = attributes.slice(:title, :open)

	unless folder.save
		errors = folder.errors.map{|e| e.first.to_s}
		return 400, errors.to_json
	end

	folder.to_json
end

delete '/api/folder/:id' do |id|
	Folder.first(:user => @user, :id => id).destroy

	return '{}'
end
