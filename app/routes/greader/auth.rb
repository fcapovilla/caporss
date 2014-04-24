# encoding: utf-8
# GReader authentication and account informations

namespace '/greader' do
	post '/accounts/ClientLogin' do
		user = User.first(:username => params['Email'])
		if user and user.password == params['Passwd']
			token = SecureRandom.hex
			Cache::tokens[token] = user.username
			"SID=unused\nLSID=unused\nAuth=#{token}"
		else
			[401, 'Error=BadAuthentication']
		end
	end

	get '/reader/ping' do
		authorize_token! :user
		'OK'
	end

	# FIXME : Code reuse
	get '/reader/subscriptions/export' do
		authorize_token! :user

		headers "Content-Disposition" => "attachment;filename=export.opml"
		content_type 'text/x-opml', 'charset' => 'utf-8'

		Nokogiri::XML::Builder.new(:encoding => 'UTF-8') { |xml|
			xml.opml(:version => '1.0') {
				xml.head {
					xml.title "OPML Export"
				}
				xml.body {
					Folder.all(:user => @user).each { |folder|
						xml.__send__ :insert, folder.to_opml
					}
				}
			}
		}.to_xml
	end

	namespace '/reader/api/0' do
		get '/token' do
			authorize_token! :user
		end

		get '/user-info' do
			authorize_token! :user

			{
				:userId => @user.id,
				:userName => @user.username,
				:userProfileId => @user.id,
				:userEmail => @user.username,
				:isBloggerUser => false,
				:signupTimeSec => 0,
				:isMultiLoginEnabled => false
			}.to_json
		end

		get '/preference/list' do
			authorize_token! :user

			{:prefs => []}.to_json
		end

		get '/friend/list' do
			authorize_token! :user

			{:friends => []}.to_json
		end
	end
end
