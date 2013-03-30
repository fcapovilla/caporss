# encoding: utf-8
class Item
	include DataMapper::Resource

	property :id, Serial
	property :title, String, :length => 200
	property :url, String, :length => 1024
	property :content, Text
	property :read, Boolean, :default => false
	property :date, DateTime

	belongs_to :feed
end
