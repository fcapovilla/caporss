source "https://rubygems.org"

gem 'thin'

gem 'sinatra'
gem 'sinatra-contrib'
gem 'sinatra-r18n'
gem 'sinatra-flash'

gem 'haml'
gem 'sass'
gem 'RedCloth'

gem 'datamapper'
gem 'dm-is-list'
gem 'moneta'

gem 'nokogiri'
gem 'feedzirra'
gem 'json'

group :development do
	gem 'dm-sqlite-adapter'
end

group :test do
	gem 'dm-sqlite-adapter'
	gem 'dm-postgres-adapter'
	gem 'dm-mysql-adapter'
	gem 'rspec'
	gem 'coveralls', require: false
	gem 'jasmine'
	gem 'rake'
end

group :production do
	gem 'dm-postgres-adapter'
	gem 'dm-mysql-adapter'

	gem 'rack-ssl-enforcer'

	gem 'therubyracer'
	gem 'uglifier'
end
