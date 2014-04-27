require_relative '../../spec_helper'

describe "GReader Feed routes" do
	before :all do
		generate_sample_feeds

		post '/greader/accounts/ClientLogin', :Email => 'admin', :Passwd => 'admin'
		last_response.body =~ /^Auth=(.*)$/
		@token = $1
	end

	context "/reader/api/0/subscription/list" do
		it "returns a list of all feeds" do
			get "/greader/reader/api/0/subscription/list", nil, 'HTTP_AUTHORIZATION' => "GoogleLogin auth=#{@token}"

			data = JSON.parse(last_response.body, :symbolize_names => true)
			user = User.first(:username => 'admin')
			feed = Feed.first(:user => user)

			data[:subscriptions].length.should == 25
			data[:subscriptions][0][:id].should == "feed/#{feed.url}"
			data[:subscriptions][0][:title].should == feed.title
			data[:subscriptions][0][:sortid].should == feed.position
			data[:subscriptions][0][:htmlUrl].should == "http://localhost:4567/"
			data[:subscriptions][0][:categories][0][:id].should == "user/#{user.id}/label/#{feed.folder.title}"
		end
	end

	context "/reader/api/0/subscription/quickadd" do
	end

	context "/reader/api/0/subscription/edit" do
	end

	context "/reader/api/0/mark-all-as-read" do
	end

	after :all do
		Folder.all.destroy
	end
end
