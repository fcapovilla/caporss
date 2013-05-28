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
		data[:url].should == "http://www.example.com/0.rss"
		data[:user_id].should == User.first(:username => 'admin').id
		data[:last_update].should == DateTime.new(2000,1,1).to_s
	end

	it "lists feed's items" do
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

	it "changes feed's url" do
		authorize 'admin', 'admin'
		feed_id = Feed.first(:title => 'Feed 0').id

		put "/feed/#{feed_id}", {:url => "http://www.example.com/4.rss"}.to_json
		last_response.body.should =~ /http:\/\/www\.example\.com\/4\.rss/
		Feed.get(feed_id).url.should == "http://www.example.com/4.rss"
	end

	it "resets feeds" do
	end

	it "creates feeds" do
	end

	it "automatically creates new folders" do
	end

	it "won't create invalid feeds" do
	end

	it "can make all of the feed's item read" do
	end

	it "can make all of the feed's item unread" do
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

	after :all do
		Folder.all.destroy
	end

end
