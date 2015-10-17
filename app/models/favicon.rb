# encoding: utf-8
require 'base64'

class Favicon
	include DataMapper::Resource

	property :id, Serial
	property :url, String, :length => 1..2000
	property :data, Text

	has n, :feeds, :constraint => :set_nil


	def fetch!
		conn = Faraday.new() do |faraday|
			faraday.use FaradayMiddleware::FollowRedirects, limit: 3
			faraday.use Faraday::Adapter::NetHttp
		end
		response = conn.get do |req|
			req.url self.url
			req.options.timeout = 5
		end

		if response.success? and response.headers['Content-Type'] =~ /^image\/.*icon$/
			data = Base64.encode64(response.body)
			self.data = data if data.length < 65535
		end

		if self.data.nil? and not self.url =~ /www/
			# Try the url with a "www"
			if self.url =~ /^https?:\/\/([^.\/]+)\.[^.\/]+(\.[^.\/]+)+\//
				response = conn.get do |req|
					req.url self.url.sub($1, 'www')
					req.options.timeout = 5
				end

				if response.success? and response.headers['Content-Type'] =~ /^image\/.*icon$/
					data = Base64.encode64(response.body)
					self.data = data if data.length < 65535
				end
			end
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
