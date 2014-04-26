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

def authorize_token!(*roles)
	token = ''
	if request.env['HTTP_AUTHORIZATION']
		parts = request.env['HTTP_AUTHORIZATION'].split
		token = parts[1].sub(/^auth=/, '') if parts[0] == 'GoogleLogin'
	end

	return token if @user and @user.authorize(roles)

	if token and Cache::store.key?("greader:#{token}")
		if @user = User.first(:username => Cache::store["greader:#{token}"])
			return token if @user.authorize(roles)
		end
	end

	halt [401, 'Unauthorized']
end
