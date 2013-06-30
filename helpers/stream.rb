# encoding: utf-8

def send_streams(event)
	@@connections.each { |out| out << "data: #{event}\n\n" }
end
