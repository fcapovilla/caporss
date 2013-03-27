# encoding: utf-8
require 'sinatra'
require 'sinatra/multi_route'
require 'sinatra/namespace'
require 'haml'
require 'sass'
require 'json'
require 'open-uri'
require 'digest/sha2'

require_relative 'models/init'


configure :production do
	# Force SSL in production
	require 'rack/ssl-enforcer'
	use Rack::SslEnforcer
end

# Load settings
Setting.all.each do |setting|
	set setting.name.to_sym, setting.value
end

if defined? settings.username and defined? settings.password
	use Rack::Auth::Basic, "Access restricted" do |username, password|
	    [username, Digest::SHA512.hexdigest(password + settings.salt)] == [settings.username, settings.password]
	end
end


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


# Save settings form
post '/save_settings' do
	# Password protected settings
	if not defined? settings.password or Digest::SHA512.hexdigest(params[:old_password] + settings.salt) == settings.password
		if params[:username]
			username = Setting.first_or_create(:name => 'username')
			username.value = params[:username]
			username.save
		end

		if params[:new_password]
			salt = ''
			64.times { salt << (i = Kernel.rand(62); i += ((i < 10) ? 48 : ((i < 36) ? 55 : 61 ))).chr }

			salt_object = Setting.first_or_create(:name => 'salt')
			salt_object.value = salt
			salt_object.save

			password = Setting.first_or_create(:name => 'password')
			password.value = Digest::SHA512.hexdigest(params[:new_password] + salt)
			password.save
		end

		# Reset settings
		Setting.all.each do |setting|
			set setting.name.to_sym, setting.value
		end
	end

	# Other settings
	if params[:cleanup_after]
		cleanup_after = Setting.first_or_create(:name => 'cleanup_after')
		cleanup_after.value = params[:cleanup_after]
		cleanup_after.save
	end

	redirect '/'
end


# Sync

namespace '/sync' do
	get '/all' do
		urls = Feed.all.map{ |feed| feed.url }
		feeds = Feedzirra::Feed.fetch_and_parse(urls)
		feeds.each do |url, xml|
			next if xml.kind_of?(Fixnum)
			feed = Feed.first(:url => url)
			feed.update_feed!(xml) if feed
		end
		return 'done'
	end

	get '/folder/:id' do |id|
		urls = Folder.get(id).feeds.map{ |feed| feed.url }
		feeds = Feedzirra::Feed.fetch_and_parse(urls)
		feeds.each do |url, xml|
			next if xml.kind_of?(Fixnum)
			feed = Feed.first(:url => url)
			feed.update_feed!(xml) if feed
		end
		return 'done'
	end

	get '/feed/:id' do |id|
		Feed.get(id).sync!
		return 'done'
	end
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

# OPML Export

get '/export.opml' do
	headers "Content-Disposition" => "attachment;filename=export.opml"
	content_type 'text/x-opml', 'charset' => 'utf-8'

	Nokogiri::XML::Builder.new(:encoding => 'UTF-8') { |xml|
		xml.opml(:version => '1.0') {
			xml.head {
				xml.title "OPML Export"
			}
			xml.body {
				Folder.all.each { |folder|
					xml.__send__ :insert, folder.to_opml
				}
			}
		}
	}.to_xml
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

get '/folder/:id/feed' do |id|
	Folder.get(id).feeds.to_json
end

# post '/folder' do

put '/folder/:id' do |id|
    folder = Folder.get(id)
	folder.attributes = JSON.parse(request.body.string, :symbolize_names => true)
	folder.save
	folder.to_json
end

delete '/folder/:id' do |id|
	Folder.get(id).destroy
end


# Feeds

get '/feed' do
    Feed.all.to_json
end

get '/feed/:id', '/folder/*/feed/:id' do
    Feed.get(params[:id]).to_json
end

get '/feed/:id/item' do |id|
	Feed.get(id).items(:order => [:date.desc]).to_json
end

#post '/feed' do

put '/feed/:id', '/folder/*/feed/:id' do
	attributes = JSON.parse(request.body.string, :symbolize_names => true)
	if attributes.has_key?(:folder)
		folder = Folder.first_or_create(:title => attributes[:folder])
		folder.save
		attributes.delete(:folder_id)
		attributes.delete(:folder)
		attributes[:folder_id] = folder.id
	end

    feed = Feed.get(params[:id])
	feed.attributes = attributes
	feed.save
	feed.to_json
end

# Mark all items in this feed as "read"
put '/read/feed/:id' do |id|
	feed = Feed.get(id)
	feed.items.each do |item|
		item.read = true
	end
	feed.unread_count = 0
	feed.save
end

# Mark all items in this feed as "unread"
put '/unread/feed/:id' do |id|
	feed = Feed.get(id)
	feed.items.each do |item|
		item.read = false
	end
	feed.save
	feed.update_unread_count!
end

delete '/feed/:id', '/folder/*/feed/:id' do
	Feed.get(params[:id]).destroy
end


# Items

get '/item' do
    Item.all(:order => [:date.desc]).to_json
end

get '/item/:id', '/feed/*/item/:id' do
    Item.get(params[:id]).to_json
end

#post '/item' do

put '/item/:id', '/feed/*/item/:id' do
    item = Item.get(params[:id])
	item.attributes = JSON.parse(request.body.string, :symbolize_names => true)
	item.save
	item.feed.update_unread_count!
	item.to_json
end

delete '/item/:id' do |id|
	Item.get(id).destroy
end
