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
