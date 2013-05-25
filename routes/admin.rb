# encoding: utf-8
# Admin page

get '/admin' do
	authorize! :admin

	haml :admin, :layout => false
end

