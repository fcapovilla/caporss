# encoding: utf-8
# Settings

post '/save_settings' do
	authorize_basic! :user

	# Password protected settings
	if @user.password == params[:old_password]
		if params[:new_password].length > 1
			@user.password = params[:new_password] if params[:new_password]
		else
			flash[:error] = t.flash.new_password_cannot_be_empty
		end
	end

	# Other settings
	@user.cleanup_after = params[:cleanup_after] if params[:cleanup_after]
	@user.refresh_timeout = params[:refresh_timeout] if params[:refresh_timeout]
	@user.sse_refresh = params[:sse_refresh] ? true : false
	@user.desktop_notifications = params[:desktop_notifications] ? true : false
	@user.sync_timeout = params[:sync_timeout] if params[:sync_timeout]
	@user.default_locale = params[:default_locale] if params[:default_locale]
	@user.items_per_page = params[:items_per_page] if params[:items_per_page]

	if @user.save
		flash[:success] = t.flash.settings_saved
	else
		errors = @user.errors.map{|e| e.first.to_s}
		flash[:error] = errors.join("<br>")
	end

	redirect '/'
end

