# encoding: utf-8
class Feed
	include DataMapper::Resource

	property :id, Serial
	property :title, String, :length => 100
	property :url, String, :length => 1..1024
	property :last_update, DateTime
	property :unread_count, Integer, :default => 0

	belongs_to :folder
	has n, :items, :constraint => :destroy
	is :list, :scope => :folder_id

	# Fetch the feed using feedzirra and update it
	def sync!
		feed = Feedzirra::Feed.fetch_and_parse(self.url)
		update_feed!(feed) unless feed.kind_of?(Fixnum) or feed.nil?
	end

	# Update the feed using a feedzirra feed object
	def update_feed!(feed)
		if feed.title and feed.title != self.title
			self.title = feed.title
		end

		feed.entries.each do |entry|
			if entry.published > self.last_update.to_time
				item = Item.new(
					:title => entry.title,
					:url => entry.url,
					:content => (entry.content || entry.summary || entry.description),
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
		self.folder.update_unread_count!
		return self
	end

	# Return an OPML XML DocumentFragment representing this feed
	def to_opml
		doc = Nokogiri::XML::DocumentFragment.parse ""
		Nokogiri::XML::Builder.with(doc) { |xml|
			xml.outline(
				:title => self.title,
				:text => self.title,
				:type => 'rss',
				:xmlUrl => self.url
			)
		}
		return doc
	end

	# Delete all items older than x days
	def cleanup!(days)
		self.items.each do |item|
			if item.date.to_date + days.to_i < Date.today
				item.destroy
			end
		end
		self.update_unread_count!
		return self
	end
end
