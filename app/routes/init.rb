# encoding: utf-8

before do
	# Force UTF-8
	content_type :html, 'charset' => 'utf-8'

	# Fetch the current user and set locale
	if session[:username]
		if @user = User.first(:username => session[:username])
			params[:locale] = @user.default_locale
		end
	end
end

before '/api/*' do
	cache_control :no_cache
end

before '/greader/*' do
	cache_control :no_cache
end


# SCSS stylesheet
get '/stylesheet.css' do
	content_type :css, 'charset' => 'utf-8'
	scss :'scss/stylesheet'
end


# Serve a concatenated version of the Backbone application
get '/app.js' do
	root = settings.root + '/backbone'
	content_type :js, 'charset' => 'utf-8'
	last_modified File.mtime("#{root}/init.js")

	# If we are in production, try to use a cached version of the backbone app
	if settings.production? and Cache::backbone
		return Cache::backbone
	end

	output = ""
	Dir[
		"#{root}/init.js",
		"#{root}/routers/*.js",
		"#{root}/models/*.js",
		"#{root}/collections/*.js",
		"#{root}/views/item.js",
		"#{root}/views/feed.js",
		"#{root}/views/folder.js",
		"#{root}/views/subscription.js",
		"#{root}/views/*.js",
		"#{root}/*.js"
	].uniq.each do |file|
		output += File.read(file)
	end

	# If we are in production, generate a minified version of the app and cache it
	if settings.production?
		require 'uglifier'
		output = Uglifier.compile(output)
		Cache::backbone = output
	end

	output
end


# Render home page
get '/', '/folder*', '/feed*', '/item*', '/favorites' do
	authorize! :user
	haml :index
end

# Manage stream connections
get '/stream' do
	authorize_basic! :user
	content_type 'text/event-stream', 'charset' => 'utf-8'
	cache_control :no_cache
	headers 'Connection' => 'keep-alive'

	user_id = @user.id

	stream :keep_open do |out|
		# Keep connection alive
		timer = EventMachine::PeriodicTimer.new(15) do
			out << ":\n\n" unless out.closed?
		end

		Cache::addConnection(user_id, out)

		out.callback do
			timer.cancel
			Cache::removeConnection(user_id, out)
		end
	end
end


# Load all routes
require_relative 'login'
require_relative 'admin'
require_relative 'settings'
require_relative 'user'
require_relative 'sync'
require_relative 'cleanup'
require_relative 'opml'
require_relative 'favorites'
require_relative 'favicon'
require_relative 'pshb'

require_relative 'api/folder'
require_relative 'api/feed'
require_relative 'api/item'

require_relative 'greader/auth'
require_relative 'greader/feed'
require_relative 'greader/folder'
require_relative 'greader/item'
