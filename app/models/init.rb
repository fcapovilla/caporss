# encoding: utf-8
require 'sequel'
require 'logger'

# AppFog Database configuration
if ENV['VCAP_SERVICES']
	require 'json'
	svcs = JSON.parse ENV['VCAP_SERVICES']
	postgres = svcs.detect { |k,v| k =~ /^postgres/ }
	mysql = svcs.detect { |k,v| k =~ /^mysql/ }
	if postgres
		creds = postgres.last.first['credentials']
		user, pass, host, name = %w(user password host name).map { |key| creds[key] }
		ENV['DATABASE_URL'] = "postgres://#{user}:#{pass}@#{host}/#{name}"
	elsif mysql
		creds = mysql.last.first['credentials']
		user, pass, host, name = %w(user password host name).map { |key| creds[key] }
		ENV['DATABASE_URL'] = "mysql://#{user}:#{pass}@#{host}/#{name}"
	end
end

# OpenShift Database configuration
if ENV['OPENSHIFT_MYSQL_DB_URL']
	ENV['DATABASE_URL'] = ENV['OPENSHIFT_MYSQL_DB_URL'] + ENV['OPENSHIFT_APP_NAME']
end
if ENV['OPENSHIFT_POSTGRESQL_DB_URL']
	ENV['DATABASE_URL'] = ENV['OPENSHIFT_POSTGRESQL_DB_URL'].sub('postgresql:', 'postgres:') + '//' + ENV['OPENSHIFT_APP_NAME']
end

# Connect to the database
Sequel.extension :migration
DB = Sequel.connect(ENV['DATABASE_URL'] || 'sqlite://rss.db')

#DB.loggers << Logger.new($stdout)

# Apply migrations
Sequel::Migrator.run(DB, "app/models/migrations")

# Load all models
require_relative 'setting'
require_relative 'user'
require_relative 'folder'
require_relative 'feed'
require_relative 'favicon'
require_relative 'item'
