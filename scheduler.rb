require 'rufus-scheduler'

require_relative 'bin/sync.rb'
require_relative 'bin/daybreak_compact.rb'

scheduler = Rufus::Scheduler.new

# Sync feeds every 30 minutes.
scheduler.every '30m', :overlap => false do
	do_sync
end

# Compact the daybreak db every day at 1:00
scheduler.cron '0 1 * * *' do
	do_daybreak_compact
end

# If the scheduler is executed alone, keep it running
if File.identical?(__FILE__, $0)
	scheduler.join
end
