source "https://rubygems.org"

gem 'sinatra'
gem 'sinatra-contrib'
gem 'sinatra-r18n'
gem 'sinatra-flash'

gem 'haml'
gem 'sass'
gem 'RedCloth'

gem 'datamapper'
gem 'dm-is-list'

gem 'feedzirra', '~> 0.2.0.rc2'
gem 'json'

group :development do
	gem 'dm-sqlite-adapter'
end

group :test do
	gem 'thin'
	gem 'dm-sqlite-adapter'
	gem 'dm-postgres-adapter'
	gem 'dm-mysql-adapter'
	gem 'rspec'
	gem 'coveralls', require: false
	gem 'jasmine'
end

group :production do
	gem 'dm-postgres-adapter'
	#gem 'dm-mysql-adapter'

	gem 'thin'
	gem 'rack-ssl-enforcer'
end
