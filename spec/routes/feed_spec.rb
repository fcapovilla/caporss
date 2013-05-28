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
