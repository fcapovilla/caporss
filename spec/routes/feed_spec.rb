require_relative '../spec_helper'

describe "Feed route" do

	before :all do
		generate_sample_feeds
	end

	it "blocks access by sync user" do
		authorize 'sync', 'sync'
		get '/feed'
		last_response.status.should == 403
	end

	it "lists feeds" do
		authorize 'admin', 'admin'
		get '/feed'
		data = JSON.parse(last_response.body, :symbolize_names => true)

		last_response.body.should =~ /Feed 0/
		data.length.should == 25
	end

	it "shows feed's informations" do
		authorize 'admin', 'admin'
		feed_id = Feed.first(:title => 'Feed 0').id

		get "/feed/#{feed_id}"
		data = JSON.parse(last_response.body, :symbolize_names => true)

		data[:id].should == feed_id
		data[:title].should == 'Feed 0'
		data[:position].should == 1
		data[:unread_count].should == 0
		data[:url].should == "http://localhost:4567/0.rss?items=3"
		data[:user_id].should == User.first(:username => 'admin').id
		data[:last_update].should == DateTime.new(2000,1,1).to_s
	end

	it "lists feed's items" do
		authorize 'admin', 'admin'
		feed_id = Feed.last(:title => 'Feed 4').id

		# Need to sync feed before listing
		post "/sync/feed/#{feed_id}"

		get "/feed/#{feed_id}/item"
		data = JSON.parse(last_response.body, :symbolize_names => true)

		data.length.should == 3
		data[0][:title].should == 'Item 2'
		data[2][:title].should == 'Item 0'
	end

	it "can't rename feeds" do
		authorize 'admin', 'admin'
		feed_id = Feed.first(:title => 'Feed 0').id

		put "/feed/#{feed_id}", {:title => "FeedTest 0"}.to_json

		last_response.body.should_not =~ /FeedTest 0/
		Feed.get(feed_id).title.should_not == "FeedTest 0"
	end

	it "moves feeds" do
		authorize 'admin', 'admin'
		feed_id = Feed.first(:title => 'Feed 1').id

		put "/feed/#{feed_id}", {:position => 1}.to_json
		data = JSON.parse(last_response.body, :symbolize_names => true)

		last_response.body.should =~ /Feed 1/
		data[:position].should == 1
		Feed.get(feed_id).position.should == 1
		Feed.first(:title => 'Feed 0').position.should == 2
	end

	it "moves feeds between folders" do
		authorize 'admin', 'admin'
		folder_from = Folder.first(:title => "Folder 1")
		folder_to = Folder.first(:title => "Folder 2")
		feed_id = Feed.first(:title => 'Feed 1', :folder => folder_from).id

		put "/feed/#{feed_id}", {:position => 4, :folder_id => folder_to.id}.to_json
		data = JSON.parse(last_response.body, :symbolize_names => true)

		last_response.body.should =~ /Feed 1/
		data[:position].should == 4
		data[:folder_id].should == folder_to.id

		feed = Feed.get(feed_id)
		feed.position.should == 4
		feed.folder_id.should == folder_to.id

		folder_feeds = folder_to.feeds(:order => :position)
		folder_feeds[0].title.should == "Feed 0"
		folder_feeds[1].title.should == "Feed 1"
		folder_feeds[2].title.should == "Feed 2"
		folder_feeds[3].title.should == "Feed 1"
		folder_feeds[4].title.should == "Feed 3"
		folder_feeds[5].title.should == "Feed 4"

		folder_feeds = folder_from.feeds(:order => :position)
		folder_feeds[0].title.should == "Feed 0"
		folder_feeds[1].title.should == "Feed 2"
		folder_feeds[2].title.should == "Feed 3"
		folder_feeds[3].title.should == "Feed 4"


		folder_to_2 = Folder.first(:title => "Folder 3")
		put "/feed/#{feed_id}", {:folder_id => folder_to_2.id}.to_json
		data = JSON.parse(last_response.body, :symbolize_names => true)

		last_response.body.should =~ /Feed 1/
		data[:position].should == 6
		data[:folder_id].should == folder_to_2.id

		feed = Feed.get(feed_id)
		feed.position.should == 6
		feed.folder_id.should == folder_to_2.id
	end

	it "can change a feed's folder using a folder title" do
		authorize 'admin', 'admin'
		folder_to = Folder.first(:title => "Folder 4")
		feed_id = Feed.first(:title => 'Feed 3').id
		put "/feed/#{feed_id}", {:folder => folder_to.title}.to_json
		data = JSON.parse(last_response.body, :symbolize_names => true)

		data[:folder_id].should == folder_to.id
	end

	it "changes feed's url" do
		authorize 'admin', 'admin'
		feed_id = Feed.first(:title => 'Feed 0').id

		put "/feed/#{feed_id}", {:url => "http://www.example.com/4.rss"}.to_json
		last_response.body.should =~ /http:\/\/www\.example\.com\/4\.rss/
		Feed.get(feed_id).url.should == "http://www.example.com/4.rss"
	end

	it "won't update feed with invalid values" do
		authorize 'admin', 'admin'
		feed_id = Feed.first(:title => 'Feed 0').id

		put "/feed/#{feed_id}", {:url => "file://test.txt"}.to_json
		last_response.status.should == 400
		Feed.get(feed_id).url.should_not == "file://test.txt"
	end

	it "resets feeds" do
		authorize 'admin', 'admin'
		feed = Feed.first(:title => 'Feed 3')
		feed.sync!
		feed.items.count.should == 3

		put "/feed/#{feed.id}", {:action => 'reset', :url => "http://localhost:4567/test.rss?items=1"}.to_json
		Feed.get(feed.id).items.count.should == 1
	end

	it "can make all of the feed's item read" do
		authorize 'admin', 'admin'
		feed = Feed.first(:title => 'Feed 4')
		feed.sync!

		feed.unread_count.should == 3
		feed.items.first.read.should == false

		put "/feed/#{feed.id}", {:action => 'read'}.to_json
		feed = Feed.get(feed.id)

		feed.unread_count.should == 0
		feed.items.first.read.should == true

		feed.title = "Feed 4"
		feed.save
	end

	it "can make all of the feed's item unread" do
		authorize 'admin', 'admin'
		feed = Feed.first(:title => 'Feed 4')

		feed.unread_count.should == 0
		feed.items.first.read.should == true

		put "/feed/#{feed.id}", {:action => 'unread'}.to_json
		feed = Feed.get(feed.id)

		feed.unread_count.should == 3
		feed.items.first.read.should == false
	end

	it "deletes feeds" do
		authorize 'admin', 'admin'
		feed_id = Feed.first(:title => 'Feed 4').id

		delete "/feed/#{feed_id}"
		last_response.status.should == 200

		get '/feed'
		data = JSON.parse(last_response.body, :symbolize_names => true)

		data.length.should == 24
		Feed.get(feed_id).should be_nil
	end

	it "creates feeds (No folder title)" do
		authorize 'admin', 'admin'
		post '/feed', :url => 'http://www.example.com/test.rss'
		data = JSON.parse(last_response.body, :symbolize_names => true)

		last_response.status.should == 200
		data[:url].should == 'http://www.example.com/test.rss'
		data[:title].should == 'http://www.example.com/test.rss'

		feed = Feed.get(data[:id])
		feed.folder.title.should == 'Feeds'
		feed.folder.feeds.count.should == 1
	end

	it "creates feeds (New folder title)" do
		authorize 'admin', 'admin'
		post '/feed', :url => 'http://www.example.com/test.rss', :folder => 'Folder X'
		data = JSON.parse(last_response.body, :symbolize_names => true)

		last_response.status.should == 200
		data[:url].should == 'http://www.example.com/test.rss'
		data[:title].should == 'http://www.example.com/test.rss'

		feed = Feed.get(data[:id])
		feed.folder.title.should == 'Folder X'
		feed.folder.feeds.count.should == 1
	end

	it "creates feeds (Existing folder title)" do
		authorize 'admin', 'admin'
		folder = Folder.first(:title => 'Folder 4')
		post '/feed', :url => 'http://www.example.com/test.rss', :folder => 'Folder 4'
		data = JSON.parse(last_response.body, :symbolize_names => true)

		last_response.status.should == 200
		data[:url].should == 'http://www.example.com/test.rss'
		data[:title].should == 'http://www.example.com/test.rss'
		data[:folder_id].should == folder.id
	end

	it "won't create invalid feeds" do
		authorize 'admin', 'admin'
		post '/feed', :url => ''
		last_response.status.should == 400
		Feed.first(:url => '').should be_nil
	end

	after :all do
		Folder.all.destroy
	end

end
