class Folder
	include DataMapper::Resource

	property :id, Serial
	property :title, String, :length => 1..30
	property :open, Boolean, :default => false

	has n, :feeds, :constraint => :destroy
	is :list
end
