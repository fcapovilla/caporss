class Item
	include DataMapper::Resource
	property :id, Serial
	property :title, String, :length => 1..100
	property :url, String, :length => 1..100
	property :content, Text
	property :read, Boolean, :default => false
	property :date, DateTime

	belongs_to :feed
end
