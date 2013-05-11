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

# SCSS stylesheet
get '/stylesheet.css' do
	content_type :css, 'charset' => 'utf-8'
	scss :stylesheet
end

# Serve a concatenated version of the Backbone application
get '/app.js' do
	root = settings.root + '/backbone'
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

# Load all routes
require_relative 'login'
require_relative 'admin'
require_relative 'user'
require_relative 'sync'
require_relative 'cleanup'
require_relative 'opml'
require_relative 'favicon'
require_relative 'folder'
require_relative 'feed'
require_relative 'item'
