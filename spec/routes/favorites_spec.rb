require_relative '../spec_helper'

describe "Favorites route" do

	before :all do
		generate_sample_feeds
	end

	it 'imports json files' do
		authorize 'admin', 'admin'
		file = Rack::Test::UploadedFile.new("spec/support/sample.json", "application/octet-stream")
		post "/favorites_upload", :file => file

		favorites = Item.all(:favorite => true)

		favorites.count.should == 3
		favorites[0].feed_id.should == Feed.first(:title => 'Feed 1').id
		favorites[0].title.should == 'Favorite 1'
		favorites[0].content.should == 'Favorite content 1'
		favorites[0].medias.keys.length.should == 1
		favorites[0].read.should == true
		favorites[1].title.should == 'Favorite 2'
		favorites[1].content.should == 'Favorite content 2'
		favorites[1].feed.should be_nil
		favorites[1].read.should == false
	end

	it 'exports favorites as json' do
		authorize 'admin', 'admin'
		get "/favorites.json"
		data = JSON.parse(last_response.body, :symbolize_names => true)

		item = Item.first(:favorite => true)

		data[:items].length.should == 3
		data[:items][0][:id].should =~ /^tag:google\.com,2005:reader\/item\/.*/
		data[:items][0][:title].should == item.title
		data[:items][0][:published].should == item.date.to_time.to_i
		data[:items][0][:canonical][0][:href].should == item.url
		data[:items][0][:alternate][0][:href].should == item.url
		data[:items][0][:summary][:content].should == item.content
		data[:items][0][:origin][:title].should == item.feed.title
		data[:items][0][:origin][:streamId].should == "feed/#{item.feed.url}"
	end

	it 'exports favorites as html' do
		authorize 'admin', 'admin'
		get "/favorites.html"

		Item.all(:favorite => true).each do |item|
			last_response.body.should =~ /<DT><A HREF="#{item.url}" ADD_DATE="#{item.date.to_time.to_i}">#{item.title}<\/A>/
		end
	end

	it 'can add custom favorites' do
		authorize 'admin', 'admin'

		post '/favorite', :url => 'http://localhost:4567/test.html'
		data = JSON.parse(last_response.body, :symbolize_names => true)
		item = Item.get(data[:id])

		Item.all(:favorite => true).count.should == 4
		item.url.should == 'http://localhost:4567/test.html'
		item.title.should == 'Title - test'
		item.feed_id.should be_nil
		item.read.should == true

		post '/favorite', :url => 'http://localhost:4567/not_found'
		data = JSON.parse(last_response.body, :symbolize_names => true)
		item = Item.get(data[:id])

		Item.all(:favorite => true).count.should == 5
		item.url.should == 'http://localhost:4567/not_found'
		item.title.should == 'http://localhost:4567/not_found'
	end

	after :all do
		Folder.all.destroy
		Item.all(:favorite => true).destroy
	end

end
