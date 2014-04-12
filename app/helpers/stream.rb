# encoding: utf-8

# Send an event and data to all Event Stream connections
def send_streams(event, data="")
	content = ""
	content += "event: #{event}\n" unless event.nil?
	if data
		if data.respond_to? 'to_json'
			content += "data: #{data.to_json}\n"
		else
			content += "data: #{data}\n"
		end
	end
	content += "\n"

	puts "Sending event '#{event}' to #{Cache::connections.length} connection(s)"

	Cache::connections.each { |out| out << content unless out.closed? }
end
