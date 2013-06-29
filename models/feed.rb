# encoding: utf-8
require 'uri'
require 'feedzirra'

class Feed
	include DataMapper::Resource

	property :id, Serial
	property :title, String, :length => 100
	property :url, String, :length => 1..2000
	property :last_update, DateTime
	property :unread_count, Integer, :default => 0

	belongs_to :user, :required => false
	belongs_to :folder
	belongs_to :favicon, :required => false
	has n, :items, :constraint => :destroy
	is :list, :scope => :folder_id

	validates_with_method :validate_url

	before :create do |feed|
		feed.last_update = DateTime.new(2000,1,1)
	end

	# Fetch the feed using feedzirra and update it
	def sync!
		feed = Feedzirra::Feed.fetch_and_parse(self.url, {:max_redirects => 3, :timeout => 30})
		update_feed!(feed) unless feed.kind_of?(Fixnum) or feed.nil?
	end

	# Update the feed using a feedzirra feed object
	def update_feed!(feed)
		if feed.title and feed.title != self.title
			self.title = feed.title
		end

		newest = nil

		feed.entries.each do |entry|
			if entry.published > self.last_update.to_time
				entry.sanitize!
				item = Item.new(
					:user => self.user,
					:title => entry.title,
					:url => entry.url,
					:content => (entry.content || entry.summary),
					:date => entry.published
				)

				# Check for podcast attachments
				if entry.respond_to?(:enclosure_url)
				  item.attachment_url = entry.enclosure_url
				end

				self.items << item

				if newest == nil or newest < entry.published
					newest = entry.published
				end
			end
		end

		self.save

		self.last_update = newest unless newest.nil?

		self.update_favicon!
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

	def update_favicon!
		uri = URI.parse(self.url)
		uri.path = '/favicon.ico'
		uri.query = nil
		uri.fragment = nil

		self.favicon = Favicon.first(:url => uri.to_s)
		unless self.favicon
			self.favicon = Favicon.new(:url => uri.to_s)
			self.favicon.fetch!
		end

		if self.favicon.data.nil?
			self.favicon = nil
		end

		self.save
	end

	def reset!
		self.items.destroy
		self.last_update = DateTime.new(2000,1,1)
		self.sync!
	end

	def validate_url
		if self.url =~ /(^$)|(^(http|https):\/\/[a-z0-9]+((\:[0-9]{1,5})?\/?.*)?$)/ix
			true
		else
			[false, "Url is not a valid URL."]
		end
	end
end
