# encoding: utf-8
class Setting
	include DataMapper::Resource

	property :id, Serial
	property :name, String
	property :value, String, :length => 200
end
