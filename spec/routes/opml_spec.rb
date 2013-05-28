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

	after :all do
		Folder.all.destroy
	end

end
