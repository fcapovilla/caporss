require 'data_mapper'

DataMapper::Logger.new(STDOUT, :debug)
DataMapper.setup(:default, ENV['DATABASE_URL'] || 'sqlite:rss.db')

require_relative 'folder'
require_relative 'feed'
require_relative 'item'

DataMapper.finalize
DataMapper.auto_upgrade!
