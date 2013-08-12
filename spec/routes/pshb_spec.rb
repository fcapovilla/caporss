require_relative '../spec_helper'

describe "Pubsubhubbub route" do

	before :all do
		admin = User.first(:username => 'admin')
		folder = Folder.create(:title => "Folder", :user => admin)
		feed = Feed.create(:title => "Feed", :url => "http://localhost:4567/1.rss?items=3&pshb=1", :user => admin)
		folder.feeds << feed
		folder.save
	end

	it 'should subscribe to a hub' do
		authorize 'admin', 'admin'

		feed = Feed.first
		feed.sync!

		feed.items.count.should == 3
		feed.pshb.should == false
		feed.pshb_hub.should == 'http://localhost:4567/pshb/hub'
		feed.pshb_topic.should == 'http://localhost:4567/1.rss?items=3&#38;pshb=1'
		feed.pshb_expiration.should be_nil

		put "/feed/#{feed.id}", {:pshb => true}.to_json

		feed.reload
		feed.pshb.should == true
		feed.pshb_expiration.should be_nil
	end

	it 'should respond correctly to hub intent validations' do
		feed = Feed.first
		feed.pshb.should == true
		feed.pshb_expiration.should be_nil

		get "/pshb/callback/#{feed.id}", :'hub.topic' => feed.pshb_topic, :'hub.mode' => 'subscribe', :'hub.lease_seconds' => '3600', :'hub.challenge' => 'abcd'
		last_response.body.should == 'abcd'

		feed.reload.pshb_expiration.should_not be_nil
	end

	it 'should add new items' do
		feed = Feed.first

		content = File.read(File.expand_path("../../support/sample.xml", __FILE__))
		post "pshb/callback/#{feed.id}", content

		last_response.status.should == 200

		sleep 1

		feed.reload
		feed.items.count.should == 4
		feed.items(:title => 'Item X').should_not be_nil
	end

	it 'should unsubscribe to a hub' do
		authorize 'admin', 'admin'

		feed = Feed.first
		feed.pshb.should == true

		put "/feed/#{feed.id}", {:pshb => false}.to_json

		feed.reload
		feed.pshb.should == false
		feed.pshb_expiration.should be_nil
	end

	after :all do
		Folder.all.destroy
	end

end
