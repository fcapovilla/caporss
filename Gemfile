source "https://rubygems.org"

gem 'sinatra'
gem 'sinatra-contrib'
gem 'sinatra-r18n'
gem 'sinatra-flash'

gem 'active_support'

gem 'haml'
gem 'sass'

gem 'datamapper'
gem 'dm-is-list'

gem 'feedzirra', '~> 0.2.0.rc2'
gem 'json'

group :development do
	gem 'dm-sqlite-adapter'
end

group :test do
	gem 'dm-sqlite-adapter'
	gem 'dm-postgres-adapter'
	gem 'dm-mysql-adapter'
	gem 'rspec'
end

group :production do
	gem 'dm-postgres-adapter'
	#gem 'dm-mysql-adapter'

	gem 'thin'
	gem 'rack-ssl-enforcer'
end
