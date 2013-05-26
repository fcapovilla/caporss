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

RSpec.configure do |config|
  config.include Rack::Test::Methods
end
