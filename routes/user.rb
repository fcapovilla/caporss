# encoding: utf-8
# User setup

namespace '/user' do
	before do
		authorize! :admin
	end

	post do
		user = User.new(
			:username => params[:username],
			:password => params[:password]
		).save

		redirect '/admin'
	end

	post '/:id' do |id|
		user = User.get(id)

		if params[:password] and params[:password].length >= 4
			user.password = params[:password]
		end

		if params[:username] and params[:username].length > 0
			user.username = params[:username]
		end

		user.save
		redirect '/admin'
	end

	delete '/:id' do |id|
		content_type :json, 'charset' => 'utf-8'

		user = User.get(id)
		unless user.roles.include?(:admin) or user.roles.include?(:sync)
			user.destroy
		end

		return '{}'
	end
end
