source "https://rubygems.org"
ruby "1.9.3"

gem 'sinatra'
gem 'sinatra-contrib'
gem 'haml'
gem 'sass'
gem 'datamapper'
gem 'dm-is-list'
gem 'feedzirra', '~> 0.2.0.rc2'

group :development do
	gem 'dm-sqlite-adapter'
end

group :production do
	gem 'dm-postgres-adapter'
	gem 'thin'
	gem 'rack-ssl-enforcer'
end
