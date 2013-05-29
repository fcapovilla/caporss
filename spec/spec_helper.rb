require 'coveralls'
Coveralls.wear!

require_relative '../app.rb'

require 'rspec'
require 'rack/test'
require 'sinatra'

# setup test environment
set :environment, :test
set :run, false
set :raise_errors, true
set :logging, false

def app
  Sinatra::Application
end

def session
  last_request.env['rack.session']
end

def generate_sample_feeds
	admin = User.first(:username => 'admin')
	5.times do |i|
		folder = Folder.create(:title => "Folder #{i}", :user => admin)

		5.times do |j|
			feed = Feed.create(:title => "Feed #{j}", :url => "http://www.example.com/#{j}.rss", :user => admin)
			folder.feeds << feed
		end

		folder.save
	end
end

RSpec.configure do |config|
  config.include Rack::Test::Methods
end
