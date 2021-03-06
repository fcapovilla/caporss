# encoding: utf-8
class Item
	include DataMapper::Resource

	property :id, Serial
	property :title, String, :length => 200
	property :url, String, :length => 2000
	property :guid, String, :length => 2000
	property :content, Text, :lazy => false
	property :attachment_url, String, :length => 2000
	property :medias, Json, :lazy => false
	property :read, Boolean, :default => false
	property :favorite, Boolean, :default => false
	property :date, DateTime
	property :orig_feed_title, String, :length => 100

	belongs_to :user, :required => false
	belongs_to :feed, :required => false
end
