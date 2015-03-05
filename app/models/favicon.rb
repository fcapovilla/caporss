# encoding: utf-8
require 'curb'
require 'base64'

class Favicon < Sequel::Model
	one_to_many :feeds

	def fetch!
		begin
			curl = Curl::Easy.new
			curl.timeout = 5
			curl.follow_location = true
			curl.url = self.url
			curl.on_success{ |resp|
				if resp.content_type =~ /^image\/.*icon$/
					data = Base64.encode64(resp.body_str)
					self.data = data if data.length < 65535
				end
			}
			curl.perform

			if self.data.nil? and not self.url =~ /www/
				# Try the url with a "www"
				if self.url =~ /^https?:\/\/([^.\/]+)\.[^.\/]+(\.[^.\/]+)+\//
					curl.url = self.url.sub($1, 'www')
					curl.perform
				end
			end
		rescue Curl::Err::TimeoutError
			# Do nothing on timeout
		end

		self.save

		return self
	end

	def data_decoded
		if self.data.nil?
			nil
		else
			Base64.decode64(self.data)
		end
	end
end
