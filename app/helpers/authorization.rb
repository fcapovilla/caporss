# encoding: utf-8

# Verify user authorisations using a session cookie
def authorize!(*roles)
	return if @user and @user.authorize(roles)

	session[:login_redirect] = request.url
	redirect '/login'
end

# Verify user authorisations using a session cookie.
# If it fails, also try to authentify the user using Basic HTTP Auth
def authorize_basic!(*roles)
	return if @user and @user.authorize(roles)

	auth ||= Rack::Auth::Basic::Request.new(request.env)
	if auth.provided? and auth.basic? and auth.credentials
		if @user = User.first(:username => auth.username)
			if @user.password == auth.credentials[1] and @user.authorize(roles)
				return
			end
		end
	end

	halt 403
end
