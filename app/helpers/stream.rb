# encoding: utf-8

def send_streams(event, data="")
	content = ""
	content += "event: #{event}\n" unless event.nil?
	content += "data: #{data}\n"
	content += "\n"
	@@connections.each { |out| out << content }
end
