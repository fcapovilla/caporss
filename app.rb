# encoding: utf-8
require 'sinatra'
require 'sinatra/multi_route'
require 'sinatra/namespace'
require 'sinatra/streaming'
require 'sinatra/r18n'
require 'sinatra/flash'
require 'rack/session/moneta'

require 'tilt/haml'
require 'tilt/sass'
require 'RedCloth'

require 'json'
require 'open-uri'

require 'daybreak'

require_relative 'app/patches/init'
require_relative 'app/helpers/init'
require_relative 'app/parsers/init'
require_relative 'app/models/init'
require_relative 'app/routes/init'


# Force SSL in production
configure :production do
	require 'rack/ssl-enforcer'
	use Rack::SslEnforcer
end

configure do
	set :first_request, true

	# Needed for Greader API support
	set :protection, :except => :path_traversal

	# Session expires after 7 days
	use Rack::Session::Moneta, store: Cache::store, expire_after: 604800

	# Set local scheduler if not in cloud environment
	unless ENV['IS_CLOUD'] then
		require_relative 'scheduler'
	end
end
