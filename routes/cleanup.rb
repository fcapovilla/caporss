# encoding: utf-8
# Cleanup

namespace '/cleanup' do
	before do
		authorize_basic! :user

		if params[:cleanup_after]
			@user.cleanup_after = params[:cleanup_after]
			@user.save
		end
	end

	post '/all' do
		Folder.all.each do |folder|
			folder.cleanup!(@user.cleanup_after)
		end
		return 'done'
	end

	post '/folder/:id' do |id|
		Folder.first(:user => @user, :id => id).cleanup!(@user.cleanup_after)
		return 'done'
	end

	post '/feed/:id' do |id|
		Feed.first(:user => @user, :id => id).cleanup!(@user.cleanup_after)
		return 'done'
	end
end

