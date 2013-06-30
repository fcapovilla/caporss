# encoding: utf-8

def send_streams(event)
	@@streams.each { |out| out << "#{event}\n" }
end
