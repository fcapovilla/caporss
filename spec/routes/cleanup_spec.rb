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
		User.first(:username => 'admin').cleanup_after.should == 400

		get "/feed/#{feed.id}/item"
		data = JSON.parse(last_response.body, :symbolize_names => true)

		data.length.should <= 2
		data.length.should >= 1
	end

	it "cleans up folders" do
		authorize 'admin', 'admin'
		folder = Folder.first(:title => 'Folder 1')
		folder.feeds.each do |feed|
			feed.sync!
		end

		post "/cleanup/folder/#{folder.id}", :cleanup_after => 400
		last_response.body.should == '"done"'
		User.first(:username => 'admin').cleanup_after.should == 400

		get "/folder/#{folder.id}/item"
		data = JSON.parse(last_response.body, :symbolize_names => true)

		data.length.should <= 10
		data.length.should >= 5
	end

	it "cleans up all feeds" do
		authorize 'admin', 'admin'
		folder = Folder.first(:title => 'Folder 2')
		folder.feeds.each do |feed|
			feed.sync!
		end

		post "/cleanup/all"
		last_response.body.should == '"done"'
		User.first(:username => 'admin').cleanup_after.should == 400

		get "/folder/#{folder.id}/item"
		data = JSON.parse(last_response.body, :symbolize_names => true)

		data.length.should <= 10
		data.length.should >= 5
	end

	after :all do
		Folder.all.destroy
	end

end
