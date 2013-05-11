# encoding: utf-8
# Folders

before '/folder*' do
	authorize_basic! :user
end

get '/folder' do
	Folder.all(:user => @user).to_json
end

get '/folder/:id' do |id|
	Folder.first(:user => @user, :id => id).to_json
end

get '/folder/:id/feed' do |id|
	Folder.first(:user => @user, :id => id).feeds.to_json
end

get '/folder/:id/item' do |id|
	options = {
		:order => [:date.desc],
		:offset => params[:offset].to_i || 0,
		:limit => params[:limit].to_i || nil
	}
	options[:read] = false if params[:show_read] == 'false'
	Folder.first(:user => @user, :id => id).feeds.items(options).to_json
end

# post '/folder' do

put '/folder/:id' do |id|
	folder = Folder.first(:user => @user, :id => id)
	folder.attributes = JSON.parse(request.body.string, :symbolize_names => true)
	if folder.save
		folder.to_json
	else
		409
	end
end

delete '/folder/:id' do |id|
	Folder.first(:user => @user, :id => id).destroy

	return '{}'
end
