# encoding: utf-8
require 'uri'
require 'net/http'

class Feed < Sequel::Model
	many_to_one :user
	many_to_one :folder
	many_to_one :favicon
	one_to_many :items

	plugin :list, :scope => :folder_id

	def validate
		super
		errors.add(:url, 'is not a valid URL.') unless validate_url
	end

	# Prevent favorites deletion
	def before_destroy
		self.items.each do |item|
			if item.favorite
				Item.get(item.id).update(:feed => nil, :orig_feed_title => self.title)
			else
				Item.get(item.id).destroy
			end
		end

		super
	end

	# Fetch the feed using Feedjira and update it
	def sync!
		feed = Feedjira::Feed.fetch_and_parse(self.url, {:max_redirects => 3, :timeout => 30, :if_modified_since => self.last_sync})
		if feed.kind_of?(Fixnum)
			self.sync_error = feed
			self.last_sync = DateTime.now
			self.save
		elsif not feed.nil?
			update_feed!(feed)
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
			false
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
