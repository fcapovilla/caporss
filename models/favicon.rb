# encoding: utf-8
require 'curb'
require 'base64'

class Favicon
	include DataMapper::Resource

	property :id, Serial
	property :url, String, :length => 1..2000
	property :data, Text

	has n, :feeds

	def fetch!
		begin
			curl = Curl::Easy.new
			curl.timeout = 5
			curl.follow_location = true
			curl.url = self.url
			curl.on_success{ |resp|
				if resp.content_type == 'image/x-icon'
					data = Base64.encode64(resp.body_str)
					self.data = data if data.length < 65535
				end
			}
			curl.perform

			unless self.data or self.url =~ /www/
				# Try the url with a "www"
				if self.url =~ /^https?:\/\/([^.\/]+)\.[^.\/]+(\.[^.\/]+)+\//
					curl.url = self.url.sub($1, 'www')
					curl.perform
				end
			end

			self.save
		rescue Curl::Err::TimeoutError
			# Do nothing on timeout
		end

		return self
	end

	def data
		if @data.nil?
			nil
		else
			Base64.decode64(@data)
		end
	end
end
