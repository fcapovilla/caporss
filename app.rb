# encoding: utf-8
require 'sinatra'
require 'sinatra/multi_route'
require 'sinatra/namespace'
require 'sinatra/r18n'
require 'haml'
require 'sass'
require 'json'
require 'open-uri'
require 'digest/sha2'

require_relative 'models/init'

# Force enclosure parsing on all Feedzirra feed entries
Feedzirra::Feed.add_common_feed_entry_element(:enclosure, :value => :url, :as => :enclosure_url)

# Load settings
Setting.all.each do |setting|
	set setting.name.to_sym, setting.value
end

# Force SSL in production
configure :production do
	require 'rack/ssl-enforcer'
	use Rack::SslEnforcer
end

configure do
	# TODO: Configurable secret option
	use Rack::Session::Pool, :expire_after => 2592000, :secret => 'needs_to_be_changed...'
end

before do
	# Force UTF-8
	content_type :html, 'charset' => 'utf-8'

	# Fetch the current user and set locale
	if session[:username]
		@user = User.first(:username => session[:username])
		params[:locale] = @user.default_locale
	end
end

# partial helper
helpers do
	def partial(page, options={})
		haml page.to_sym, options.merge!(:layout => false)
	end

	def authorize!(*roles)
		return if @user and @user.authorize(roles)

		session[:login_redirect] = request.url
		redirect '/login'
	end

	def authorize_basic!(*roles)
		return if @user and @user.authorize(roles)

		auth ||= Rack::Auth::Basic::Request.new(request.env)
		if auth.provided? and auth.basic? and auth.credentials
			if @user = User.first(:username => auth.username)
				if @user.password == auth.credentials[1] and @user.authorize(roles)
					return
				end
			end
		end

		halt 403
	end
end

# SCSS stylesheet
get '/stylesheet.css' do
	content_type :css, 'charset' => 'utf-8'
	scss :stylesheet
end

# Serve a concatenated version of the Backbone application
get '/app.js' do
	root = File.dirname(__FILE__) + '/backbone'
	content_type :js, 'charset' => 'utf-8'
	last_modified File.mtime("#{root}/init.js")
	output = ''

	Dir["#{root}/lib/*.js"].each do |file|
		output += File.open(file, 'r').read()
	end

	output += "$(function() {\n"

	Dir["#{root}/routers/*.js", "#{root}/models/*.js", "#{root}/collections/*.js", "#{root}/views/*.js", "#{root}/*.js"].each do |file|
		output += File.open(file, 'r').read()
	end

	output + "});"
end


# Render home page
get '/' do
	authorize! :user
	haml :index
end


# Login page
get '/login' do
	haml :login, :layout => false
end

get '/logout' do
	session.clear
	redirect '/login'
end

post '/login' do
	user = User.first(:username => params[:username])
	if user and user.password == params[:password]
		session[:username] = params[:username]
		if session[:login_redirect]
			redirect session.delete(:login_redirect)
		else
			redirect '/'
		end
	else
		haml :login, :layout => false
	end
end


# Admin page
get '/admin' do
	authorize! :admin

	haml :admin, :layout => false
end

post '/admin' do
	authorize! :admin

	haml :admin, :layout => false
end

# User setup
namespace '/user' do
	before do
		authorize! :admin
	end

	post do
		user = User.new(
			:username => params[:username],
			:password => params[:password]
		).save

		redirect '/admin'
	end

	post '/:id' do |id|
		if params[:password] and params[:password].length >= 4
			user = User.get(id)
			user.password = params[:password]
			user.save
		end

		redirect '/admin'
	end

	delete '/:id' do |id|
		User.get(id).destroy

		return 'done'
	end
end


# Save settings form
post '/save_settings' do
	authorize_basic! :user

	# Password protected settings
	if @user.password == params[:old_password]
		@user.password = params[:new_password] if params[:new_password]
	end

	# Other settings
	@user.cleanup_after = params[:cleanup_after] if params[:cleanup_after]
	@user.refresh_timeout = params[:refresh_timeout] if params[:refresh_timeout]
	@user.sync_timeout = params[:sync_timeout] if params[:sync_timeout]
	@user.default_locale = params[:default_locale] if params[:default_locale]
	@user.items_per_page = params[:items_per_page] if params[:items_per_page]

	@user.save

	redirect '/'
end


# Sync
post '/full_sync' do
	authorize_basic! :sync

	urls = Feed.all.map{ |feed| feed.url }
	urls.uniq!
	feeds = Feedzirra::Feed.fetch_and_parse(urls)
	updated_count = 0
	new_items = 0
	feeds.each do |url, xml|
		next if xml.kind_of?(Fixnum)
		Feed.all(:url => url).each_with_index do |feed, i|
			old_count = feed.items.count if i==0

			feed.update_feed!(xml)
			updated_count+=1

			new_items += feed.items.count - old_count if i==0
		end
	end
	{ :updated => updated_count, :new_items => new_items }.to_json
end

namespace '/sync' do
	before do
		authorize_basic! :user
	end

	post '/all' do
		urls = Feed.all(:user => @user).map{ |feed| feed.url }
		feeds = Feedzirra::Feed.fetch_and_parse(urls)
		updated_count = 0
		new_items = 0
		feeds.each do |url, xml|
			next if xml.kind_of?(Fixnum)
			feed = Feed.first(:user => @user, :url => url)
			old_count = feed.items.count

			feed.update_feed!(xml) if feed

			updated_count+=1
			new_items += feed.items.count - old_count
		end
		{ :updated => updated_count, :new_items => new_items }.to_json
	end

	post '/folder/:id' do |id|
		urls = Folder.first(:user => @user, :id => id).feeds.map{ |feed| feed.url }
		feeds = Feedzirra::Feed.fetch_and_parse(urls)
		updated_count = 0
		new_items = 0
		feeds.each do |url, xml|
			next if xml.kind_of?(Fixnum)
			feed = Feed.first(:user => @user, :url => url)
			old_count = feed.items.count

			feed.update_feed!(xml) if feed

			updated_count+=1
			new_items += feed.items.count - old_count
		end
		{ :updated => updated_count, :new_items => new_items }.to_json
	end

	post '/feed/:id' do |id|
		feed = Feed.first(:user => @user, :id => id)
		old_count = feed.items.count

		feed.sync!

		new_items = feed.items.count - old_count
		{ :updated => 1, :new_items => new_items }.to_json
	end
end


# Cleanup
namespace '/cleanup' do
	before do
		authorize_basic! :user

		if params[:cleanup_after]
			@user.cleanup_after = params[:cleanup_after]
			@user.save
		end
	end

	post '/all' do
		Folder.all.each do |folder|
			folder.cleanup!(@user.cleanup_after)
		end
		return 'done'
	end

	post '/folder/:id' do |id|
		Folder.first(:user => @user, :id => id).cleanup!(@user.cleanup_after)
		return 'done'
	end

	post '/feed/:id' do |id|
		Feed.first(:user => @user, :id => id).cleanup!(@user.cleanup_after)
		return 'done'
	end
end


# Import OPML Files
post '/opml_upload' do
	authorize_basic! :user

	opml = Nokogiri::XML(params[:file][:tempfile].read)
	opml.css('body>outline').each do |root_node|
		# If the root node is a feed, add it to the "Feeds" folder
		if root_node['type'] == 'rss'
			folder = Folder.first_or_create(:user => @user, :title => 'Feeds')
			feed = Feed.new(
				:user => @user,
				:title => root_node['title'],
				:url => root_node['xmlUrl'],
				:last_update => DateTime.new(2000,1,1)
			)
			folder.feeds << feed
			folder.save
		else
			# The root node is a folder. Get all his feeds.
			title = root_node['title'] || root_node['text']
			folder = Folder.first_or_create(:user => @user, :title => title)
			root_node.css('outline').each do |node|
				feed = Feed.new(
					:user => @user,
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
	authorize_basic! :user

	headers "Content-Disposition" => "attachment;filename=export.opml"
	content_type 'text/x-opml', 'charset' => 'utf-8'

	Nokogiri::XML::Builder.new(:encoding => 'UTF-8') { |xml|
		xml.opml(:version => '1.0') {
			xml.head {
				xml.title "OPML Export"
			}
			xml.body {
				Folder.all(:user => @user).each { |folder|
					xml.__send__ :insert, folder.to_opml
				}
			}
		}
	}.to_xml
end


# Subscription
post '/subscribe' do
	authorize_basic! :user

	params[:folder] = 'Feeds' if params[:folder].empty?
	folder = Folder.first_or_create(:user => @user, :title => params[:folder])
	feed = Feed.new(
		:user => @user,
		:title => params[:url],
		:url => params[:url],
		:last_update => DateTime.new(2000,1,1)
	)
	folder.feeds << feed
	folder.save

	feed.sync!

	return 'done'
end


# Favicons
namespace '/favicon' do
	before do
		authorize_basic! :user
	end

	get '/:id.ico' do |id|
		content_type 'image/x-icon'
		expires Time.now + (60*60*24*7), :public
		Favicon.get(id).data_decoded
	end

	post '/fetch_all' do
		Favicon.all.each { |favicon| favicon.fetch! }
		return 'done'
	end
end


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

#post '/feed' do

post '/reset/feed/:id' do
	authorize_basic! :user

	feed = Feed.first(:user => @user, :id => params[:id])
	feed.items.destroy
	feed.last_update = DateTime.new(2000,1,1)
	feed.save

	feed.sync!

	return 'done'
end

put '/feed/:id', '/folder/*/feed/:id' do
	attributes = JSON.parse(request.body.string, :symbolize_names => true)

	# Convert the folder name into a folder_id
	if attributes.has_key?(:folder)
		folder = Folder.first_or_create(:user => @user, :title => attributes[:folder])
		folder.save
		attributes.delete(:folder_id)
		attributes.delete(:folder)
		attributes[:folder_id] = folder.id
	end

	feed = Feed.first(:user => @user, :id => params[:id])
	old_folder = feed.folder
	feed.attributes = attributes
	feed.save

	feed.update_unread_count!
	old_folder.update_unread_count!

	feed.to_json
end

# Mark all items in this feed as "read"
put '/read/feed/:id' do |id|
	authorize_basic! :user

	feed = Feed.first(:user => @user, :id => id)
	feed.items.each do |item|
		item.read = true
	end
	feed.unread_count = 0
	feed.save
	feed.folder.update_unread_count!

	feed.to_json
end

# Mark all items in this feed as "unread"
put '/unread/feed/:id' do |id|
	authorize_basic! :user

	feed = Feed.first(:user => @user, :id => id)
	feed.items.each do |item|
		item.read = false
	end
	feed.save
	feed.update_unread_count!

	feed.to_json
end

delete '/feed/:id', '/folder/*/feed/:id' do
	feed = Feed.first(:user => @user, :id => params[:id])
	old_folder = feed.folder
	feed.destroy
	old_folder.update_unread_count!

	return '{}'
end


# Items
#
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
