require_relative '../spec_helper'

describe "Cleanup route" do

	before :all do
		generate_sample_feeds
	end

	it "cleans up feeds" do
		authorize 'admin', 'admin'
		feed = Feed.first(:title => 'Feed 1')
		feed.sync!

		post "/cleanup/feed/#{feed.id}", :cleanup_after => 400
		last_response.body.should == '"done"'
		user = User.first(:username => 'admin')
		user.cleanup_after.should == 400

		feed.reload
		feed.items.count.should >= 1
		feed.items.count.should <= 2
	end

	it "cleans up folders" do
		authorize 'admin', 'admin'
		folder = Folder.first(:title => 'Folder 1')
		folder.feeds.each do |feed|
			feed.sync!
		end

		post "/cleanup/folder/#{folder.id}", :cleanup_after => 400
		last_response.body.should == '"done"'
		user = User.first(:username => 'admin')
		user.cleanup_after.should == 400

		folder.reload
		folder.feeds.items.count.should >= 5
		folder.feeds.items.count.should <= 10
	end

	it "cleans up all feeds" do
		authorize 'admin', 'admin'
		folder = Folder.first(:title => 'Folder 2')
		folder.feeds.each do |feed|
			feed.sync!
		end

		post "/cleanup/all"
		last_response.body.should == '"done"'
		user = User.first(:username => 'admin')
		user.cleanup_after.should == 400

		folder.reload
		folder.feeds.items.count.should >= 5
		folder.feeds.items.count.should <= 10
	end

	after :all do
		Folder.all.destroy
	end

end
