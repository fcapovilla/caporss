# encoding: utf-8
require 'sinatra'
require 'sinatra/multi_route'
require 'sinatra/namespace'
require 'sinatra/r18n'
require 'sinatra/flash'

require 'haml'
require 'sass'

require 'json'
require 'open-uri'
require 'active_support/core_ext/hash/slice'

require_relative 'models/init'
require_relative 'helpers/init'
require_relative 'routes/init'


# Force SSL in production
configure :production do
	require 'rack/ssl-enforcer'
	use Rack::SslEnforcer
end

configure do
	use Rack::Session::Pool, :secret => (ENV['SESSION_SECRET'] || 'Default secret... Set the SESSION_SECRET environment variable!')

	# Force enclosure parsing on all Feedzirra feed entries
	Feedzirra::Feed.add_common_feed_entry_element(:enclosure, :value => :url, :as => :enclosure_url)

	# Load settings
	Setting.all.each do |setting|
		set setting.name.to_sym, setting.value
	end
end
