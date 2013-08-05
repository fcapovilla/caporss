# encoding: utf-8

# Send an event and data to all Event Stream connections
def send_streams(event, data="")
	content = ""
	content += "event: #{event}\n" unless event.nil?
	content += "data: #{data}\n"
	content += "\n"
	@@connections.each { |out| out << content }
end