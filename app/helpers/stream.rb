# encoding: utf-8

# Send an event and data to Event Stream connections
# If user_id is not specified, the event will be send to all connections
def send_streams(event, data="", userid=0)
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

	connections = (userid ? Cache::connections(userid) : Cache::connections)

	return if connections.nil?

	connections.each { |out| out << content unless out.closed? }
end
