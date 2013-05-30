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
			feed_id = Feed.first(:title => 'Feed 0').id

			post "/sync/feed/#{feed_id}"
			data = JSON.parse(last_response.body, :symbolize_names => true)

			data[:updated].should == 1
			data[:new_items].should == 3

			# Title should have been updated after sync
			feed = Feed.get(feed_id)
			feed.title.should == 'Test title'
			feed.items.count.should == 3
		end

		it "syncs all of a folder's feeds" do
			authorize 'admin', 'admin'
			folder_id = Folder.first(:title => 'Folder 1').id

			post "/sync/folder/#{folder_id}"
			data = JSON.parse(last_response.body, :symbolize_names => true)

			data[:updated].should == 5
			data[:new_items].should == 15

			# Feed titles should have been updated after sync
			feed = Folder.get(folder_id).feeds.first
			feed.title.should == 'Test title'
			feed.items.count.should == 3
		end

		it "syncs all of a user's feeds" do
			authorize 'admin', 'admin'

			post "/sync/all"
			data = JSON.parse(last_response.body, :symbolize_names => true)

			data[:updated].should == 25
			data[:new_items].should == 57  # 75 - 15 - 3

			# Feed titles should have been updated after sync
			feed = Folder.first(:title => 'Folder 2').feeds.first
			feed.title.should == 'Test title'
			feed.items.count.should == 3
		end

		it "fetches new feeds and updates feed title" do
			authorize 'admin', 'admin'

			feed = Feed.first(:title => 'Test title')
			feed.url = "http://localhost:4567/test.rss?items=5&title=AAAAA"
			feed.save

			post "/sync/feed/#{feed.id}"
			data = JSON.parse(last_response.body, :symbolize_names => true)

			data[:updated].should == 1
			data[:new_items].should == 2

			# Title should have been updated after sync
			feed = Feed.get(feed.id)
			feed.title.should == 'AAAAA'
			feed.items.count.should == 5
		end

		it "prevents non-sync users from syncing all feeds" do
			authorize 'user', 'user'
			post "/full_sync"
			last_response.status.should == 403
		end

		after :all do
			Folder.all.destroy
			User.first(:username => 'user').destroy
		end

	end

	context "for sync users" do

		before :all do
			generate_sample_feeds
		end

		it "lets the sync user sync all feeds" do
			authorize 'sync', 'sync'
			post "/full_sync"
			data = JSON.parse(last_response.body, :symbolize_names => true)

			data[:updated].should == 25
			data[:new_items].should == 75
		end

		after :all do
			Folder.all.destroy
		end

	end

end
