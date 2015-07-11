require_relative '../spec_helper'

describe "Sync route" do

	context "for normal users" do

		before :all do
			generate_sample_feeds
			User.new(
				:username => 'user',
				:password => 'user',
				:roles => [:user]
			).save
		end

		it "syncs a single feed" do
			authorize 'admin', 'admin'
			feed = Feed.first(:title => 'Feed 0')

			post "/sync/feed/#{feed.id}"
			data = JSON.parse(last_response.body, :symbolize_names => true)

			data[:updated].should == 1
			data[:new_items].should == 3

			# Title should have been updated after sync
			feed.reload
			feed.title.should == 'Test title'
			feed.items.count.should == 3
		end

		it "won't add back cleaned up items" do
			authorize 'admin', 'admin'
			feed = Feed.first(:title => 'Feed 1')
			feed.user.update(:cleanup_after => 1)

			post "/sync/feed/#{feed.id}"
			data = JSON.parse(last_response.body, :symbolize_names => true)

			data[:updated].should == 1
			data[:new_items].should == 3

			# Read one item and clean it up
			feed.reload
			feed.items.first.update(:read => true)
			feed.cleanup!(0)

			feed.items.count.should == 2

			post "/sync/feed/#{feed.id}"
			data = JSON.parse(last_response.body, :symbolize_names => true)

			data[:updated].should == 1
			data[:new_items].should == 0
			feed.reload.items.count.should == 2

			# Reset cleanup_after value
			feed.user.update(:cleanup_after => 1000000)
		end

		it "syncs all of a folder's feeds" do
			authorize 'admin', 'admin'
			folder = Folder.first(:title => 'Folder 1')
			feed = folder.feeds.first

			folder.feeds.items.count.should == 0
			folder.unread_count.should == 0

			feed.title.should_not == 'Test title'
			feed.items.count.should == 0
			feed.unread_count.should == 0


			post "/sync/folder/#{folder.id}"
			data = JSON.parse(last_response.body, :symbolize_names => true)

			data[:updated].should == 5
			data[:new_items].should == 15


			folder.reload
			folder.feeds.items.count.should == 15
			folder.unread_count.should == 15

			feed.reload
			feed.title.should == 'Test title'
			feed.items.count.should == 3
			feed.unread_count.should == 3
		end

		it "syncs all of a user's feeds" do
			authorize 'admin', 'admin'
			folder = Folder.first(:title => 'Folder 2')
			folder2 = Folder.first(:title => 'Folder 3')
			feed = folder.feeds.first

			folder.feeds.items.count.should == 0
			folder.unread_count.should == 0

			folder2.feeds.items.count.should == 0
			folder2.unread_count.should == 0

			feed.title.should_not == 'Test title'
			feed.items.count.should == 0
			feed.unread_count.should == 0

			Folder.all.feeds.items.count.should == 20


			post "/sync/all"
			data = JSON.parse(last_response.body, :symbolize_names => true)

			data[:updated].should == 25
			data[:new_items].should == 55  # 75 - 15 - 6


			folder.reload
			folder.feeds.items.count.should == 15
			folder.unread_count.should == 15

			folder2.reload
			folder2.feeds.items.count.should == 15
			folder2.unread_count.should == 15

			feed.reload
			feed.title.should == 'Test title'
			feed.items.count.should == 3

			Folder.all.feeds.items.count.should == 75
		end

		it "fetches new feeds, updates feeds and updates feed title" do
			authorize 'admin', 'admin'

			feed = Feed.first(:title => 'Test title')
			feed.url = "http://localhost:4567/test.rss?items=5&title=AAAAA"
			feed.items.first(:guid => '0').destroy
			feed.items.first(:guid => '1').title = 'Old title'
			feed.save

			feed.title.should == 'Test title'
			feed.items.count.should == 2
			feed.items.first(:guid => '1').title.should == 'Old title'

			post "/sync/feed/#{feed.id}"
			data = JSON.parse(last_response.body, :symbolize_names => true)

			data[:updated].should == 1
			data[:new_items].should == 3

			# Title should have been updated after sync
			feed.reload
			feed.title.should == 'AAAAA'
			feed.items.count.should == 5
			feed.items.first(:guid => '0').should_not be_nil
			feed.items.first(:guid => '1').title.should == "Item 1"
		end

		after :all do
			Folder.all.destroy
			User.first(:username => 'user').destroy
		end

	end

end
