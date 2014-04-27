require_relative '../../spec_helper'

describe "GReader Auth routes" do
	before :all do
		generate_sample_feeds

		post '/greader/accounts/ClientLogin', :Email => 'admin', :Passwd => 'admin'
		last_response.body =~ /^Auth=(.*)$/
		@token = $1
	end

	context "/accounts/ClientLogin" do
		it "blocks bad credentials" do
			post '/greader/accounts/ClientLogin', :Email => 'abcd', :Passwd => 'abcd'
			last_response.body.should == "Error=BadAuthentication"
		end

		it "blocks empty credentials" do
			post '/greader/accounts/ClientLogin', :Email => '', :Passwd => ''
			last_response.body.should == "Error=BadAuthentication"
		end

		it "accepts good credentials" do
			post '/greader/accounts/ClientLogin', :Email => 'admin', :Passwd => 'admin'
			last_response.body.should_not == "Error=BadAuthentication"
			last_response.body.should =~ /^SID=/
			last_response.body.should =~ /^LSID=/
			last_response.body.should =~ /^Auth=/
		end

		it "generates random tokens" do
			post '/greader/accounts/ClientLogin', :Email => 'admin', :Passwd => 'admin'
			last_response.body =~ /^Auth=(.*)$/
			token2 = $1

			@token.should_not == token2
		end
	end

	context "/reader/ping" do
		it "returns OK if token is valid" do
			get "/greader/reader/ping", nil, 'HTTP_AUTHORIZATION' => "GoogleLogin auth=#{@token}"
			last_response.status.should == 200
			last_response.body.should == "OK"
		end

		it "returns Unauthorized if token is invalid" do
			get "/greader/reader/ping", nil, 'HTTP_AUTHORIZATION' => "GoogleLogin auth=AAA"
			last_response.status.should == 401
			last_response.body.should == "Unauthorized"
		end
	end

	context "/reader/api/0/token" do
		it "returns the token only if it is valid" do
			get "/greader/reader/api/0/token", nil, 'HTTP_AUTHORIZATION' => "GoogleLogin auth=#{@token}"
			last_response.status.should == 200
			last_response.body.should == @token

			get "/greader/reader/api/0/token", nil, 'HTTP_AUTHORIZATION' => "GoogleLogin auth=AAA"
			last_response.status.should == 401
			last_response.body.should == "Unauthorized"
		end
	end

	context "/reader/api/0/user-info" do
		it "returns basic user informations" do
			get "/greader/reader/api/0/user-info", nil, 'HTTP_AUTHORIZATION' => "GoogleLogin auth=#{@token}"
			last_response.status.should == 200

			data = JSON.parse(last_response.body, :symbolize_names => true)
			user = User.first(:username => 'admin')

			data[:userId].should == user.id
			data[:userName].should == user.username
			data[:userProfileId].should == user.id
			data[:userEmail].should == user.username
		end
	end

	context "/reader/api/0/preference/list" do
		it "returns an empty list" do
			get "/greader/reader/api/0/preference/list", nil, 'HTTP_AUTHORIZATION' => "GoogleLogin auth=#{@token}"
			last_response.status.should == 200
			last_response.body.should == '{"prefs":[]}'
		end
	end

	context "/reader/api/0/friend/list" do
		it "returns an empty list" do
			get "/greader/reader/api/0/friend/list", nil, 'HTTP_AUTHORIZATION' => "GoogleLogin auth=#{@token}"
			last_response.status.should == 200
			last_response.body.should == '{"friends":[]}'
		end
	end

	context "/reader/subscriptions/export" do
		it "returns all feeds as OPML" do
			get "/greader/reader/subscriptions/export", nil, 'HTTP_AUTHORIZATION' => "GoogleLogin auth=#{@token}"
			opml = Nokogiri::XML(last_response.body)

			opml.css('body>outline').length.should == 5
			opml.css('body>outline').first['title'].should == 'Folder 0'
			opml.css('outline[type="rss"]').length.should == 25
			opml.css('outline[type="rss"]').first['title'].should == 'Feed 0'
			opml.css('outline[type="rss"][title="Feed 0"]').length.should == 5
		end
	end

	after :all do
		Folder.all.destroy
	end
end
