# encoding: utf-8
# Folders

before '/folder*' do
	authorize_basic! :user
	content_type :json, 'charset' => 'utf-8'
end

get '/folder' do
	Folder.all(:user => @user, :order => :position.asc).to_json
end

get '/folder/:id' do |id|
	Folder.first(:user => @user, :id => id).to_json
end

get '/folder/:id/feed' do |id|
	Folder.first(:user => @user, :id => id).feeds(:order => :position.asc).to_json
end

get '/folder/:id/item' do |id|
	options = {
		:order => [:date.desc],
		:offset => params[:offset].to_i || 0
	}
	options[:limit] = params[:limit].to_i unless params[:limit].nil?
	options[:read] = false if params[:show_read] == 'false'
	unless params[:query].nil?
		if params[:search_title] == 'true'
			options[:title.like] = "%#{params[:query]}%"
		else
			options[:content.like] = "%#{params[:query]}%"
		end
	end
	Folder.first(:user => @user, :id => id).feeds.items(options).to_json
end

# post '/folder' do

put '/folder/:id' do |id|
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

delete '/folder/:id' do |id|
	Folder.first(:user => @user, :id => id).destroy

	return '{}'
end
