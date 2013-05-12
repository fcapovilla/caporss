# encoding: utf-8
require 'data_mapper'
require 'dm-types'
require 'dm-is-list'
require 'feedzirra'

DataMapper::Logger.new(STDOUT, :warn)

# AppFog Database configuration
if ENV['VCAP_SERVICES']
	require 'json'
	svcs = JSON.parse ENV['VCAP_SERVICES']
	postgres = svcs.detect { |k,v| k =~ /^postgres/ }.last.first
	mysql = svcs.detect { |k,v| k =~ /^mysql/ }.last.first
	if postgres
		creds = postgres['credentials']
		user, pass, host, name = %w(user password host name).map { |key| creds[key] }
		ENV['DATABASE_URL'] = "postgres://#{user}:#{pass}@#{host}/#{name}"
	elsif mysql
		creds = postgres['credentials']
		user, pass, host, name = %w(user password host name).map { |key| creds[key] }
		ENV['DATABASE_URL'] = "mysql://#{user}:#{pass}@#{host}/#{name}"
	end
end

# Connect to the database
DataMapper.setup(:default, ENV['DATABASE_URL'] || 'sqlite:rss.db')

# Load all models
require_relative 'setting'
require_relative 'user'
require_relative 'folder'
require_relative 'feed'
require_relative 'favicon'
require_relative 'item'

# Upgrade the database
DataMapper.finalize.auto_upgrade!

# Apply migrations
require_relative 'migrations'
