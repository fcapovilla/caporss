require_relative '../spec_helper'

describe "Pubsubhubbub route" do

	before :all do
		admin = User.first(:username => 'admin')

		folder = Folder.create(:title => "Folder", :user => admin)
		feed = Feed.create(:title => "Feed", :url => "http://localhost:4567/1.rss?items=3&pshb=active", :user => admin)
		folder.feeds << feed
		folder.save

		generate_sample_feeds
	end

	it 'subscribes to a hub' do
		authorize 'admin', 'admin'

		feed = Feed.first
		feed.sync!

		feed.items.count.should == 3
		feed.pshb.should == :inactive
		feed.pshb_hub.should == 'http://localhost:4567/pshb/hub'
		feed.pshb_topic.should == 'http://localhost:4567/1.rss?items=3&pshb=active'
		feed.pshb_expiration.should be_nil

		put "/api/feed/#{feed.id}", {:pshb => "active"}.to_json

		feed.reload
		feed.pshb.should == :requested
		feed.pshb_expiration.should be_nil
	end

	it 'denies unknown or invalid intent validations' do
		feed = Feed.first
		feed.pshb.should == :requested
		feed.pshb_expiration.should be_nil

		get "/pshb/callback/#{feed.id}", :'hub.topic' => 'invalid topic', :'hub.mode' => 'subscribe', :'hub.lease_seconds' => '3600', :'hub.challenge' => 'abcd'
		last_response.status.should == 404

		feed.reload
		feed.pshb.should == :requested
		feed.pshb_expiration.should be_nil

		get "/pshb/callback/999", :'hub.topic' => feed.pshb_topic, :'hub.mode' => 'subscribe', :'hub.lease_seconds' => '3600', :'hub.challenge' => 'abcd'
		last_response.status.should == 404
	end

	it 'responds correctly to hub intent validations' do
		feed = Feed.first
		feed.pshb.should == :requested
		feed.pshb_expiration.should be_nil

		get "/pshb/callback/#{feed.id}", :'hub.topic' => feed.pshb_topic, :'hub.mode' => 'subscribe', :'hub.lease_seconds' => '3600', :'hub.challenge' => 'abcd'
		last_response.body.should == 'abcd'

		feed.reload
		feed.pshb_expiration.should_not be_nil
		feed.pshb.should == :active
	end

	it 'does nothing on invalid callback calls' do
		feed = Feed.last
		feed.items.count.should == 0

		content = File.read(File.expand_path("../../support/sample.xml", __FILE__))
		post "pshb/callback/#{feed.id}", content

		last_response.status.should == 200

		sleep 1

		feed.reload.items.count.should == 0


		feed = Feed.first
		feed.items.count.should == 3

		post "pshb/callback/#{feed.id}", "Invalid feed text"

		last_response.status.should == 200

		sleep 1

		feed.reload.items.count.should == 3
	end

	it 'adds new items when callback is called' do
		feed = Feed.first

		content = File.read(File.expand_path("../../support/sample.xml", __FILE__))
		post "pshb/callback/#{feed.id}", content

		last_response.status.should == 200

		sleep 1

		feed.reload
		feed.items.count.should == 4
		feed.items(:title => 'Item X').should_not be_nil
	end

	it 'unsubscribes to a hub' do
		authorize 'admin', 'admin'

		feed = Feed.first
		feed.pshb.should == :active

		put "/api/feed/#{feed.id}", {:pshb => "inactive"}.to_json

		feed.reload
		feed.pshb.should == :inactive
		feed.pshb_expiration.should_not be_nil
	end

	after :all do
		Folder.all.destroy
	end

end
