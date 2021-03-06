# Start test server (For fake rss feeds)
@server_thread = Thread.new do
  require_relative 'support/test_server.rb'
  TestServer.run! { trap(:INT, 'DEFAULT') }
end
sleep 1

require 'coveralls'
Coveralls.wear!

require 'rspec'
require 'rack/test'

require_relative '../app.rb'

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

	# Force admin cleanup_after value
	admin.update(:cleanup_after => 1000000)

	5.times do |i|
		folder = Folder.create(:title => "Folder #{i}", :user => admin)

		5.times do |j|
			feed = Feed.create(:title => "Feed #{j}", :url => "http://localhost:4567/#{j}.rss?items=3", :user => admin)
			folder.feeds << feed
		end

		folder.save
	end
end

RSpec.configure do |config|
  config.include Rack::Test::Methods

  config.expect_with :rspec do |c|
    c.syntax = :should
  end

  config.tty = true
  config.formatter = :documentation
end
