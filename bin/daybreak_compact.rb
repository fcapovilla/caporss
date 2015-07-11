require 'daybreak'

def do_daybreak_compact
	db = Daybreak::DB.new "daybreak_store"
	db.compact
	db.close
end

if File.identical?(__FILE__, $0)
	do_daybreak_compact
end
