require 'rufus-scheduler'
require 'daybreak'

require_relative 'app/parsers/init'
require_relative 'app/models/init'

scheduler = Rufus::Scheduler.new

# Sync feeds every 30 minutes.
scheduler.every '30m', :overlap => false do
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
		# TODO: Tell the server new items were found.
		#send_streams "sync:new_items"
	end

	Feed.all(:pshb => :active).each do |feed|
		# Resubscribe if the Pubsubhubbub subscription is almost expired
		if feed.pshb_expiration and feed.pshb_expiration < Time.now + (60*60*2)
			feed.pshb_subscribe!(uri('/pshb/callback'))
		end
	end
end

# Compact the daybreak db every day at 1:00
scheduler.cron '0 1 * * *' do
	db = Daybreak::DB.new "daybreak_store"
	db.compact
	db.close
end

# If the scheduler is executed alone, keep it running
if File.identical?(__FILE__, $0)
	scheduler.join
end
