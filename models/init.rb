# encoding: utf-8
require 'data_mapper'
require 'dm-is-list'
require 'feedzirra'

DataMapper::Logger.new(STDOUT, :warn)

# AppFog Database configuration
if ENV['VCAP_SERVICES']
	require 'json'
	svcs = JSON.parse ENV['VCAP_SERVICES']
	postgres = svcs.detect { |k,v| k =~ /^postgres/ }.last.first
	creds = postgres['credentials']
	user, pass, host, name = %w(user password host name).map { |key| creds[key] }
	ENV['DATABASE_URL'] = "postgres://#{user}:#{pass}@#{host}/#{name}"
end

# Connect to the database
DataMapper.setup(:default, ENV['DATABASE_URL'] || 'sqlite:rss.db')

# Load all models
require_relative 'setting'
require_relative 'folder'
require_relative 'feed'
require_relative 'item'

# Upgrade the database
DataMapper.finalize
DataMapper.auto_upgrade!

# Set default settings
if Setting.count == 0
	Setting.create(:name => 'username', :value => 'admin')
	Setting.create(:name => 'salt', :value => '')
	Setting.create(:name => 'password', :value => Digest::SHA512.hexdigest('admin'))
	Setting.create(:name => 'cleanup_after', :value => '300')
end
