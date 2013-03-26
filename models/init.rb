require 'data_mapper'
require 'dm-is-list'
require 'feedzirra'

DataMapper::Logger.new(STDOUT, :warn)
DataMapper.setup(:default, ENV['DATABASE_URL'] || 'sqlite:rss.db')

require_relative 'setting'
require_relative 'folder'
require_relative 'feed'
require_relative 'item'

DataMapper.finalize
DataMapper.auto_upgrade!

# Set default settings
if Setting.all.count == 0
	Setting.create(:name => 'username', :value => 'admin')
	Setting.create(:name => 'salt', :value => '')
	Setting.create(:name => 'password', :value => Digest::SHA512.hexdigest('admin'))
end
