# encoding: utf-8
# Settings

post '/save_settings' do
	authorize_basic! :user

	# Password protected settings
	if @user.password == params[:old_password]
		@user.password = params[:new_password] if params[:new_password]
	end

	# Other settings
	@user.cleanup_after = params[:cleanup_after] if params[:cleanup_after]
	@user.refresh_timeout = params[:refresh_timeout] if params[:refresh_timeout]
	@user.sync_timeout = params[:sync_timeout] if params[:sync_timeout]
	@user.default_locale = params[:default_locale] if params[:default_locale]
	@user.items_per_page = params[:items_per_page] if params[:items_per_page]

	@user.save

	redirect '/'
end

