# encoding: utf-8
# Favicons

namespace '/favicon' do
	before do
		authorize_basic! :user
	end

	get '/:id.ico' do |id|
		content_type 'image/x-icon'
		expires Time.now + (60*60*24*7), :public
		Favicon.get(id).data_decoded
	end

	post '/fetch_all' do
		Favicon.all.each { |favicon| favicon.fetch! }
		return 'done'
	end
end
