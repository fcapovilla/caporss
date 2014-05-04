require_relative '../spec_helper'

describe "Cleanup route" do

	before :all do
		generate_sample_feeds
	end

	it "does not clean up unread items" do
		authorize 'admin', 'admin'
		feed = Feed.first(:title => 'Feed 1')
		feed.sync!
		feed.items.count.should == 3

		post "/cleanup/feed/#{feed.id}", :cleanup_after => 400
		last_response.body.should == '"done"'
		user = User.first(:username => 'admin')
		user.cleanup_after.should == 400

		feed.reload
		feed.items.count.should == 3
	end

	it "does not clean up favorite items" do
		authorize 'admin', 'admin'
		feed = Feed.first(:title => 'Feed 2')
		feed.sync!
		feed.items.count.should == 3
		feed.items.update(:favorite => true, :read => true)

		post "/cleanup/feed/#{feed.id}", :cleanup_after => 1
		last_response.body.should == '"done"'
		user = User.first(:username => 'admin')
		user.cleanup_after.should == 1

		feed.reload
		feed.items.count.should == 3
	end

	it "cleans up feeds" do
		authorize 'admin', 'admin'
		feed = Feed.first(:title => 'Feed 3')
		feed.sync!
		feed.items.update(:read => true)

		post "/cleanup/feed/#{feed.id}", :cleanup_after => 400
		last_response.body.should == '"done"'
		user = User.first(:username => 'admin')
		user.cleanup_after.should == 400

		feed.reload
		feed.items.count.should >= 2
		feed.items.count.should <= 3
	end

	it "cleans up folders" do
		authorize 'admin', 'admin'
		folder = Folder.first(:title => 'Folder 1')
		folder.feeds.each do |feed|
			feed.sync!
			feed.items.update(:read => true)
		end

		post "/cleanup/folder/#{folder.id}", :cleanup_after => 400
		last_response.body.should == '"done"'
		user = User.first(:username => 'admin')
		user.cleanup_after.should == 400

		folder.reload
		folder.feeds.items.count.should >= 10
		folder.feeds.items.count.should <= 15
	end

	it "cleans up all feeds" do
		authorize 'admin', 'admin'
		folder = Folder.first(:title => 'Folder 2')
		folder.feeds.each do |feed|
			feed.sync!
			feed.items.update(:read => true)
		end

		post "/cleanup/all"
		last_response.body.should == '"done"'
		user = User.first(:username => 'admin')
		user.cleanup_after.should == 400

		folder.reload
		folder.feeds.items.count.should >= 10
		folder.feeds.items.count.should <= 15
	end

	after :all do
		Folder.all.destroy
	end

end
