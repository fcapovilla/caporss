# encoding: utf-8
class Folder
	include DataMapper::Resource

	property :id, Serial
	property :title, String, :length => 1..200
	property :open, Boolean, :default => true
	property :unread_count, Integer, :default => 0

	belongs_to :user, :required => false
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

	# Return an OPML XML DocumentFragment representing this feed
	def to_opml
		doc = Nokogiri::XML::DocumentFragment.parse ""
		Nokogiri::XML::Builder.with(doc) { |xml|
			xml.outline(:title => self.title, :text => self.title) {
				self.feeds.each do |feed|
					xml.__send__ :insert, feed.to_opml
				end
			}
		}
		return doc
	end

	# Delete all items older than x days
	def cleanup!(days)
		self.feeds.each do |feed|
			feed.cleanup!(days)
		end
		return self
	end
end
