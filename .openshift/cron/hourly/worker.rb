# Example worker script that syncs all feeds.
# Connects to the CapoRSS instance using the 'sync' user via Basic Auth.
require "net/https"
require "uri"


# Enter the "sync" user's password
password = 'sync'
# Enter the website's URL
url = 'https://' + ENV['OPENSHIFT_APP_DNS']


uri = URI.parse(url + '/full_sync')

http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true
http.read_timeout = 500
http.verify_mode = OpenSSL::SSL::VERIFY_NONE

request = Net::HTTP::Post.new(uri.request_uri)
request.basic_auth 'sync', password

response = http.request(request)

puts response.body
