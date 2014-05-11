# encoding: utf-8

# Get a remote page's title
def http_get_title(uri_str, limit = 10)
	return nil if limit == 0

	uri = URI.parse(uri_str)
	http = Net::HTTP::new(uri.host, uri.port)
	http.use_ssl = true if uri.scheme.downcase == "https"
	path = '/'
	path = uri.path unless uri.path.nil? or uri.path.empty?
	path +='?' + uri.query unless uri.query.nil? or uri.query.empty?
	response = http.request_get(path)

	case response
	when Net::HTTPRedirection
		puts response['location']
		http_get_title(response['location'], limit - 1)
	when Net::HTTPSuccess
		doc = Nokogiri::HTML::Document.parse(response.read_body)
		if not doc.nil? and doc.title
			doc.title
		else
			nil
		end
	else
		nil
	end
end
