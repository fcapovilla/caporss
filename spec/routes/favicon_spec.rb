require_relative '../spec_helper'

describe "Favicon route" do

	before :all do
		generate_sample_feeds
	end

	it 'returns a favicon image' do
		authorize 'admin', 'admin'
		feed = Feed.first(:title => 'Feed 1')
		feed.sync!

		get "/favicon/#{feed.favicon.id}.ico"
		last_response.status.should == 200
		last_response.content_type.should == 'image/x-icon'
		last_response.body.length.should >= 1
	end

	it 'fetches new favicons' do
		authorize 'admin', 'admin'

		favicon = Favicon.first
		favicon.data = ''
		favicon.save
		favicon.data.length.should == 0

		post "/favicon/fetch_all"
		last_response.status.should == 200

		favicon = Favicon.first
		favicon.data.length.should >= 1
	end

	it 'should share favicons betweens feeds on the same host' do
		authorize 'admin', 'admin'
		feed = Feed.first(:title => 'Feed 2')
		feed.sync!
		feed2 = Feed.first(:title => 'Feed 3')
		feed2.sync!

		feed.favicon.id.should == feed2.favicon.id
	end

	after :all do
		Folder.all.destroy
	end

end
