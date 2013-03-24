class Folder
	include DataMapper::Resource

	property :id, Serial
	property :title, String, :length => 1..30
	property :open, Boolean, :default => false
	property :unread_count, Integer, :default => 0

	has n, :feeds, :constraint => :destroy
	is :list

	def update_unread_count!
		self.unread_count = 0
		self.feeds.each do |feed|
			self.unread_count += feed.unread_count
		end
		self.save
		return self
	end
end
