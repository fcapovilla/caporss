# encoding: utf-8
# User setup

namespace '/user' do
	before do
		authorize! :admin
	end

	post do
		if params[:password].length < 1
			flash[:error] = t.flash.new_password_cannot_be_empty.to_s
			redirect '/admin'
		end

		user = User.new(
			:username => params[:username],
			:password => params[:password]
		)

		if user.save
			flash[:success] = t.flash.user_created.to_s
		else
			errors = user.errors.map{|e| e.first.to_s}
			flash[:error] = errors.join("<br>")
		end

		redirect '/admin'
	end

	post '/:id' do |id|
		user = User.get(id)

		unless params[:password].nil?
			if params[:password].length > 0
				user.password = params[:password]
			else
				flash[:error] = t.flash.new_password_cannot_be_empty.to_s
				redirect '/admin'
			end
		end

		user.username = params[:username] unless params[:username].nil?

		if user.save
			flash[:success] = t.flash.user_updated.to_s
		else
			errors = user.errors.map{|e| e.first.to_s}
			flash[:error] = errors.join("<br>")
		end

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
