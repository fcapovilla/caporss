require 'rufus-scheduler'

require_relative 'bin/sync.rb'

scheduler = Rufus::Scheduler.new

# Sync feeds every 5 minutes.
scheduler.every '5m', :overlap => false do
	do_sync
end

# If the scheduler is executed alone, keep it running
if File.identical?(__FILE__, $0)
	scheduler.join
end
