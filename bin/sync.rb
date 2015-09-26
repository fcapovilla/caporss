require_relative '../app/patches/init'
require_relative '../app/parsers/init'
require_relative '../app/models/init'

def do_sync
	base_url = Cache::store['base_url']

	last_sync = DateTime.now

	urls = Feed.all(:pshb.not => :active).map{ |feed|
		if feed.last_sync < last_sync
			last_sync = feed.last_sync
		end
		feed.url
	}
	urls.uniq!

	feeds = Feedjira::Feed.fetch_and_parse(urls, {:max_redirects => 3, :timeout => 30, :if_modified_since => last_sync})

	updated_count = 0
	new_items = 0
	errors = 0
	feeds.each do |url, xml|
		Feed.all(:url => url, :pshb.not => :active).each do |feed|
			if xml.kind_of?(Fixnum)
				errors+=1

				feed.sync_error = xml
				feed.last_sync = DateTime.now
				feed.save
			else
				old_count = feed.items.count

				feed.update_feed!(xml)
				updated_count+=1

				new_items += feed.items.count - old_count
			end
		end
	end

	if new_items > 0
		#Tell the server new items were found.
		if defined? send_streams
			send_streams "sync:new_items"
		end
	end

	Feed.all(:pshb => :active).each do |feed|
		# Resubscribe if the Pubsubhubbub subscription is almost expired
		if feed.pshb_expiration and feed.pshb_expiration < Time.now + (60*60*2)
			feed.pshb_subscribe!(base_url + '/pshb/callback')
		end
	end
end

if File.identical?(__FILE__, $0)
	do_sync
end
