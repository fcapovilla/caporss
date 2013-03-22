# encoding: utf-8
require 'sinatra'
require 'haml'
require 'sass'
require 'json'
require 'open-uri'

require_relative 'models/init'

before do
    content_type :html, 'charset' => 'utf-8'
end

get '/stylesheet.css' do
    content_type :css, 'charset' => 'utf-8'
    scss :stylesheet
end

get '/' do
    haml :index
end

get '/syncAll' do
	urls = Feed.all.map{ |feed| feed.url }
	feeds = Feedzirra::Feed.fetch_and_parse(urls)
	feeds.each do |url, xml|
		next if xml.kind_of?(Fixnum)
		feed = Feed.first(:url => url)
		feed.update_feed!(xml) if feed
	end
	return 'done'
end

# Import OPML Files

post '/opml_upload' do
	opml = Nokogiri::XML(params[:file][:tempfile].read)
	opml.css('body>outline').each do |root_node|
		# If the root node is a feed, add it to the "Feeds" folder
		if root_node['type'] == 'rss'
			folder = Folder.first_or_create(:title => 'Feeds')
			feed = Feed.new(
				:title => root_node['title'],
				:url => root_node['xmlUrl'],
				:last_update => DateTime.new(2000,1,1)
			)
			folder.feeds << feed
			folder.save
		else
			# The root node is a folder. Get all his feeds.
			folder = Folder.first_or_create(:title => root_node['title'])
			root_node.css('outline').each do |node|
				feed = Feed.new(
					:title => node['title'],
					:url => node['xmlUrl'],
					:last_update => DateTime.new(2000,1,1)
				)
				folder.feeds << feed
			end
			folder.save
		end
	end

	redirect '/'
end

# Subscription

post '/subscribe' do
	params[:folder] = 'Feeds' if params[:folder].empty?
	folder = Folder.first_or_create(:title => params[:folder])
	feed = Feed.new(
		:title => params[:url],
		:url => params[:url],
		:last_update => DateTime.new(2000,1,1)
	)
	folder.feeds << feed
	folder.save

	feed.sync!

	return 'done'
end


# Folders

get '/folder' do
    Folder.all.to_json
end

get '/folder/:id' do |id|
    Folder.get(id).to_json
end

post '/folder' do
    Folder.create(params)
end

put '/folder/:id' do |id|
    folder = Folder.get(id)
	folder.attributes = JSON.parse(request.body.string, :symbolize_name => true)
	folder.save
end

delete '/folder/:id' do |id|
	Folder.get(id).destroy
end

get '/folder/:id/feed' do |id|
	Folder.get(id).feeds.to_json
end

get '/sync/folder/:id' do |id|
	urls = Folder.get(id).feeds.map{ |feed| feed.url }
	feeds = Feedzirra::Feed.fetch_and_parse(urls)
	feeds.each do |url, xml|
		next if xml.kind_of?(Fixnum)
		feed = Feed.first(:url => url)
		feed.update_feed!(xml) if feed
	end
	return 'done'
end


# Feeds

get '/feed' do
    Feed.all.to_json
end

get '/feed/:id' do |id|
    Feed.get(id).to_json
end

get '/folder/*/feed/:id' do |x,id|
    Feed.get(id).to_json
end

post '/feed' do
    Feed.create(params)
end

put '/feed/:id' do |id|
    feed = Feed.get(id)
	feed.attributes = JSON.parse(request.body.string, :symbolize_name => true)
	feed.save
end

delete '/feed/:id' do |id|
	Feed.get(id).destroy
end

delete '/folder/*/feed/:id' do |x,id|
	Feed.get(id).destroy
end

get '/feed/:id/item' do |id|
	Feed.get(id).items.to_json
end

get '/sync/feed/:id' do |id|
	Feed.get(id).sync!
	return 'done'
end


# Items

get '/item' do
    Item.all.to_json
end

get '/item/load' do

end

get '/item/:id' do |id|
    Item.get(id).to_json
end

get '/feed/*/item/:id' do |x,id|
	Item.get(id).to_json
end

post '/item' do
    Item.create(params)
end

put '/item/:id' do |id|
    item = Item.get(id)
	item.attributes = JSON.parse(request.body.string, :symbolize_name => true)
	item.save
	item.feed.update_unread_count!
end

put '/feed/*/item/:id' do |x,id|
    item = Item.get(id)
	item.attributes = JSON.parse(request.body.string, :symbolize_name => true)
	item.save
	item.feed.update_unread_count!
end

delete '/item/:id' do |id|
	Item.get(id).destroy
end
