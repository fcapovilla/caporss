require_relative '../spec_helper'

describe "OPML route" do

	before :all do
		generate_sample_feeds
	end

	it 'returns all feeds and folders as an OPML file' do
		authorize 'admin', 'admin'
		get "/export.opml"
		opml = Nokogiri::XML(last_response.body)

		opml.css('body>outline').length.should == 5
		opml.css('body>outline').first['title'].should == 'Folder 0'
		opml.css('outline[type="rss"]').length.should == 25
		opml.css('outline[type="rss"]').first['title'].should == 'Feed 0'
		opml.css('outline[type="rss"][title="Feed 0"]').length.should == 5
	end

	it 'imports opml files' do
		authorize 'admin', 'admin'
		file = Rack::Test::UploadedFile.new("spec/support/sample.opml", "application/octet-stream")
		post "/opml_upload", :file => file

		Folder.first(:title => 'Folder 1').feeds.count.should == 6

		folder2 = Folder.first(:title => 'Folder 2')
		folder2.feeds.count.should == 7
		folder2.feeds.first(:title => 'NewFeed 2').should_not be_nil
		folder2.feeds.first(:title => 'NewFeed 2-2').should_not be_nil

		Folder.first(:title => 'NewFolder 3').should_not be_nil
		Folder.first(:title => 'NewFolder 3').feeds.first(:title => 'NewFeed 3').should_not be_nil

		newfeed4 = Feed.first(:title => 'NewFeed 4')
		newfeed4.folder.title.should == 'Feeds'
		newfeed4.url.should == "http://localhost:4567/test.rss?items=4"
		newfeed4.items.count.should == 0
		newfeed4.sync!
		newfeed4.items.count.should == 4
	end

	after :all do
		Folder.all.destroy
	end

end
