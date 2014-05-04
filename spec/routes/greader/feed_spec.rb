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
		it "adds new feeds" do
			post "/greader/reader/api/0/subscription/quickadd",
				{:quickadd => "http://www.example.com/test.rss"},
				'HTTP_AUTHORIZATION' => "GoogleLogin auth=#{@token}"

			data = JSON.parse(last_response.body, :symbolize_names => true)
			data[:numResults].should == 1
			data[:streamId].should == "feed/http://www.example.com/test.rss"

			feed = Feed.last
			feed.folder.title.should == 'Feeds'
			feed.folder.feeds.count.should == 1
			feed.url.should == "http://www.example.com/test.rss"
		end
	end

	context "/reader/api/0/subscription/edit" do
		it "removes feeds" do
			feed = Feed.first(:url => "http://localhost:4567/1.rss?items=3")
			Feed.all.count.should == 26

			post "/greader/reader/api/0/subscription/edit",
				{
					:ac => 'unsubscribe',
					:s => 'feed/http://localhost:4567/1.rss?items=3'
				},
				'HTTP_AUTHORIZATION' => "GoogleLogin auth=#{@token}"

			last_response.body.should == 'OK'

			Feed.all.count.should == 25
			Feed.get(feed.id).should be_nil
		end

		it "subscribes to new feeds" do
			post "/greader/reader/api/0/subscription/edit",
				{
					:ac => "subscribe",
					:s => "feed/http://www.example.com/test2.rss",
					:t => "Title2",
					:a => "user/-/label/New Folder"
				},
				'HTTP_AUTHORIZATION' => "GoogleLogin auth=#{@token}"

			last_response.body.should == 'OK'

			feed = Feed.last
			feed.folder.title.should == 'New Folder'
			feed.folder.feeds.count.should == 1
			feed.url.should == "http://www.example.com/test2.rss"
			feed.title.should == "Title2"
		end

		it "modifies existing feeds" do
			feed = Feed.last
			feed.url.should == "http://www.example.com/test2.rss"
			feed.title.should == "Title2"
			feed.folder.title.should == 'New Folder'

			post "/greader/reader/api/0/subscription/edit",
				{
					:ac => "edit",
					:s => "feed/http://www.example.com/test2.rss",
					:t => "Title3",
					:a => "user/-/label/New Folder 2",
					:r => "user/-/label/New Folder"
				},
				'HTTP_AUTHORIZATION' => "GoogleLogin auth=#{@token}"

			last_response.body.should == 'OK'

			feed.reload
			feed.folder.title.should == 'New Folder 2'
			feed.folder.feeds.count.should == 1
			feed.url.should == "http://www.example.com/test2.rss"
			feed.title.should == "Title3"
		end
	end

	context "/reader/api/0/mark-all-as-read" do
		it "marks all items of a feed as read" do
			feed = Feed.first(:url => 'http://localhost:4567/1.rss?items=3')
			feed.sync!

			feed.unread_count.should == 3

			post "/greader/reader/api/0/mark-all-as-read",
				{
					:s => 'feed/http://localhost:4567/1.rss?items=3'
				},
				'HTTP_AUTHORIZATION' => "GoogleLogin auth=#{@token}"

			last_response.body.should == 'OK'

			feed.reload
			feed.unread_count.should == 0
		end

		it "marks all items of a folder as read" do
			folder = Folder.first(:title => 'Folder 1')

			authorize 'admin', 'admin'
			post "/sync/folder/#{folder.id}"

			folder.reload
			folder.unread_count.should == 12
			folder.feeds.last.unread_count.should == 3

			post "/greader/reader/api/0/mark-all-as-read",
				{
					:s => 'user/-/label/Folder 1'
				},
				'HTTP_AUTHORIZATION' => "GoogleLogin auth=#{@token}"

			last_response.body.should == 'OK'

			folder.reload
			folder.unread_count.should == 0
			folder.feeds.last.unread_count.should == 0
		end
	end

	after :all do
		Folder.all.destroy
	end
end
