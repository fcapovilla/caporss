require_relative '../app/patches/init'
require_relative '../app/parsers/init'
require_relative '../app/models/init'

def do_sync
	updated_count = 0
	new_items = 0
	errors = 0

	Feed.all(:pshb.not => :active, :order => [:last_sync.asc], :limit => 20).each do |feed|
		old_count = feed.items.count

		feed.sync!

		updated_count+=1
		new_items += feed.items.count - old_count

		if feed.sync_error
			errors+=1
		end
	end

	if new_items > 0
		#Tell the server new items were found.
		if defined? send_streams
			send_streams "sync:new_items"
		end
	end

	base_url = Cache::store['base_url']

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
