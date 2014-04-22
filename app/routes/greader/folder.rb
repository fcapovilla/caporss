# encoding: utf-8
# GReader Tags (Folders)

namespace '/greader' do
	namespace '/reader/api/0' do
		get '/tag/list' do
			authorize_token! :user

			tags = []

			Folder.all(:user => @user).each do |folder|
				tags << {
					:id => "user/#{@user.id}/label/#{folder.title}",
					:sortid => folder.position
				}
			end

			{:tags => tags}.to_json
		end

		get '/rename-tag' do
			{}.to_json # TODO
		end

		get '/disable-tag' do
			{}.to_json # TODO
		end

		get '/edit-tag' do
			{}.to_json # TODO
		end

		get '/preference/stream/list' do
			{}.to_json # TODO
		end

		get '/preference/stream/set' do
			{}.to_json # TODO
		end
	end
end
