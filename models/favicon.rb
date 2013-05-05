# encoding: utf-8
require 'uri'
require 'curb'
require 'base64'

class Favicon
	include DataMapper::Resource

	property :id, Serial
	property :url, String, :length => 1..2000
	property :data, String, :length => 10000

	has n, :feeds

	def fetch!
		curl = Curl::Easy.new
		curl.timeout = 5
		curl.follow_location = true
		curl.url = self.url
		curl.on_success{ |resp|
			if resp.content_type == 'image/x-icon'
				@data = Base64.encode64(resp.body_str)
				self.save
			end
		}
		curl.perform

		return (@data ? self : nil)
	end

	def data
		Base64.decode64(@data)
	end
end
