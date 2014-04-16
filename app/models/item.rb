# encoding: utf-8
class Item
	include DataMapper::Resource

	property :id, Serial
	property :title, String, :length => 200
	property :url, String, :length => 2000
	property :guid, String, :length => 2000
	property :content, Text
	property :attachment_url, String, :length => 2000
	property :medias, Json
	property :read, Boolean, :default => false
	property :date, DateTime

	belongs_to :user, :required => false
	belongs_to :feed
end
