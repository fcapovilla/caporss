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
gem 'feedjira'
gem 'json'

group :development, :travis, :test do
	gem 'dm-sqlite-adapter'
end

group :travis, :test do
	gem 'rspec'
	gem 'coveralls', require: false
	gem 'jasmine'
	gem 'rake'
end

group :travis, :production do
	gem 'dm-postgres-adapter'
	gem 'dm-mysql-adapter'
end

group :production do
	gem 'rack-ssl-enforcer'

	gem 'therubyracer'
	gem 'uglifier'
end
