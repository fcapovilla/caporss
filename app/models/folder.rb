# encoding: utf-8
class Folder < Sequel::Model
	many_to_one :user
	one_to_many :feeds

	plugin :list

	def update_unread_count!
		self.unread_count = 0
		self.feeds.each do |feed|
			self.unread_count += feed.unread_count
		end
		self.save
		return self
	end

	# Return an OPML XML DocumentFragment representing this folder
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
