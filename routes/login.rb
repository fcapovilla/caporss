# encoding: utf-8
# Login page

get '/login' do
	haml :login, :layout => false
end

post '/login' do
	user = User.first(:username => params[:username])
	if user and user.password == params[:password]
		session[:username] = params[:username]
		if session[:login_redirect]
			redirect session.delete(:login_redirect)
		else
			redirect '/'
		end
	else
		haml :login, :layout => false
	end
end

get '/logout' do
	session.clear
	redirect '/login'
end
