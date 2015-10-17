# encoding: utf-8
require 'uri'
require 'net/http'
require 'faraday'
require 'faraday_middleware'

class Feed
	include DataMapper::Resource

	property :id, Serial
	property :title, String, :length => 100
	property :url, String, :length => 1..2000
	property :last_update, DateTime, :default => DateTime.new(2000,1,1)
	property :last_sync, DateTime, :default => DateTime.new(2000,1,1)
	property :unread_count, Integer, :default => 0
	property :sync_error, Integer, :default => 0

	property :pshb_hub, String, :length => 0..2000, :default => ''
	property :pshb_topic, String, :length => 0..2000, :default => ''
	property :pshb_expiration, Time
	property :pshb, Enum[:inactive, :active, :requested, :unavailable], :default => :unavailable

	belongs_to :user, :required => false
	belongs_to :folder
	belongs_to :favicon, :required => false
	has n, :items, :constraint => :skip
	is :list, :scope => :folder_id

	validates_with_method :validate_url


	# Prevent favorites deletion
	before :destroy do
		self.items.each do |item|
			if item.favorite
				Item.get(item.id).update(:feed => nil, :orig_feed_title => self.title)
			else
				Item.get(item.id).destroy
			end
		end
	end

	# Fetch the feed, parse it and update it
	def sync!
		conn = Faraday.new() do |faraday|
			faraday.use FaradayMiddleware::FollowRedirects, limit: 3
			faraday.use Faraday::Adapter::NetHttp
		end
		response = conn.get do |req|
			req.url self.url
			req['If-Modified-Since'] = self.last_sync.rfc822
			req.options.timeout = 30
		end

		if response.success?
			begin
				feed = Feedjira::Feed.parse response.body
				update_feed!(feed)
			rescue
				self.sync_error = -1
				self.last_sync = DateTime.now
				self.save
			end
		else
			self.sync_error = response.status
			self.last_sync = DateTime.now
			self.save
		end
	end

	# Update the feed using a Feedjira feed object
	def update_feed!(feed)
		if feed.hub
			if self.pshb == :unavailable
				self.pshb = :inactive
				self.pshb_hub = feed.hub

				if feed.topic and feed.topic =~ /^#{URI::regexp}$/
					self.pshb_topic = feed.topic
				else
					self.pshb_topic = self.url
				end

				# Exception for Youtube feeds
				if self.pshb_topic =~ /^http:\/\/gdata\.youtube\.com/
					uri = URI.parse(self.pshb_topic)
					uri.query = 'v=2'
					self.pshb_topic = uri.to_s
				end
			end
		else
			unless [:active, :requested].include? self.pshb
				self.pshb_hub = ''
				self.pshb_topic = ''
				self.pshb_expiration = nil
				self.pshb = :unavailable
			end
		end

		if feed.title and feed.title != self.title
			self.title = feed.title
		end

		self.sync_error = 0
		self.save

		newest = nil

		feed.entries.each do |entry|
			entry.sanitize!

			medias = nil
			if entry.respond_to? :medias and !entry.medias.empty?
				medias = Hash.from_pairs(entry.media_types, entry.medias)
			end

			create = false

			if entry.id
				item = self.items.first(:guid => entry.id)

				if item
					# Update existing item
					item.update(
						:title => entry.title,
						:url => entry.url,
						:content => (entry.content || entry.summary),
						:date => entry.published,
						:attachment_url => entry.enclosure_url,
						:medias => medias
					)
				else
					create = true
				end
			else
				# No GUID found, use the publication date for duplication check
				create = true if entry.published > self.last_update.to_time
			end

			# If the feed got updated at least once
			if self.last_update != DateTime.new(2000,1,1)
				# Don't add items with a publishing date before the cleanup date
				if self.user and entry.published < (Date.today - self.user.cleanup_after).to_time
					create = false
				end
			end

			if create
				item = Item.new(
					:user => self.user,
					:title => entry.title,
					:url => entry.url,
					:content => (entry.content || entry.summary),
					:date => entry.published,
					:guid => entry.id,
					:attachment_url => entry.enclosure_url,
					:medias => medias
				)

				self.items << item
			end

			if newest == nil or newest < entry.published
				newest = entry.published
			end
		end

		self.save

		self.last_update = newest unless newest.nil?
		self.last_sync = DateTime.now

		self.update_favicon!
		self.update_unread_count!
		return self
	end

	def update_unread_count!
		self.unread_count = self.items.all(:read => false).count
		self.save
		self.folder.feeds.reload
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

	# Delete all read items older than x days
	# Ignore favorites
	def cleanup!(days)
		self.items.all(:favorite => false).each do |item|
			if item.read and item.date.to_date + days.to_i < Date.today
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

	# TODO : Add hub.secret support
	def pshb_subscribe!(callback)
		uri = URI.parse(self.pshb_hub)

		self.pshb = :requested
		self.save

		response = Net::HTTP.post_form(uri, {
			'hub.callback' => "#{callback}/#{self.id}",
			'hub.topic' => self.pshb_topic,
			'hub.mode' => 'subscribe'
		})

		if response.code != '202'
			self.pshb = :inactive
			self.save
		end
	end

	def pshb_unsubscribe!(callback)
		uri = URI.parse(self.pshb_hub)

		self.pshb = :inactive
		self.save

		Net::HTTP.post_form(uri, {
			'hub.callback' => "#{callback}/#{self.id}",
			'hub.topic' => self.pshb_topic,
			'hub.mode' => 'unsubscribe'
		})
	end
end
