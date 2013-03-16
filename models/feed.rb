require 'feedzirra'

class Feed
	include DataMapper::Resource
	property :id, Serial
	property :title, String, :length => 1..100
	property :url, String, :length => 1..1000
	property :last_update, DateTime
	property :unread_count, Integer, :default => 0
	belongs_to :folder
	has n, :items, :constraint => :destroy

	def sync!
		feed = Feedzirra::Feed.fetch_and_parse(self.url)
		update_feed!(feed) unless feed.kind_of?(Fixnum)
	end

	def update_feed!(feed)
		feed.entries.each do |entry|
			if entry.published > self.last_update
				item = Item.new(
					:title => entry.title,
					:url => entry.url,
					:content => entry.summary,
					:date => entry.published
				)
				self.items << item
			end
		end
		self.save

		self.last_update = Time.now
		self.update_unread_count!
		return self
	end

	def update_unread_count!
		self.unread_count = self.items.all(:read => false).count
		self.save
		return self
	end
end
