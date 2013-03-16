require 'data_mapper'

DataMapper.setup(:default, ENV['DATABASE_URL'] || 'sqlite::memory:')

require_relative 'note'

DataMapper.finalize
DataMapper.auto_upgrade!
