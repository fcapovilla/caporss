require_relative '../../spec_helper'

describe "GReader Item routes" do
	before :all do
		generate_sample_feeds

		post '/greader/accounts/ClientLogin', :Email => 'admin', :Passwd => 'admin'
		last_response.body =~ /^Auth=(.*)$/
		@token = $1

		authorize 'admin', 'admin'
		post "/sync/all"
	end

	context "/reader/api/0/stream/contents/*" do
		it "displays a feed's items" do
			feed = Feed.first

			get "/greader/reader/api/0/stream/contents/feed/#{CGI::escape(feed.url)}",
				{},
				'HTTP_AUTHORIZATION' => "GoogleLogin auth=#{@token}"

			data = JSON.parse(last_response.body, :symbolize_names => true)

			data[:id].should == "feed/#{feed.url}"
			data[:items].length.should == 3

			item = feed.items.first(:order => [:date.desc])
			data[:items][0][:id].should =~ /^tag:google\.com,2005:reader\/item\/.*/
			data[:items][0][:title].should == item.title
			data[:items][0][:published].should == item.date.to_time.to_i
			data[:items][0][:canonical][0][:href].should == item.url
			data[:items][0][:alternate][0][:href].should == item.url
			data[:items][0][:summary][:content].should == item.content
			data[:items][0][:origin][:title].should == feed.title
			data[:items][0][:origin][:streamId].should == "feed/#{feed.url}"
			data[:items][0][:published].should > data[:items][2][:published]
		end

		it "displays a folder's items" do
			folder = Folder.first

			get "/greader/reader/api/0/stream/contents/user/-/label/#{URI::escape(folder.title)}",
				{},
				'HTTP_AUTHORIZATION' => "GoogleLogin auth=#{@token}"

			data = JSON.parse(last_response.body, :symbolize_names => true)

			data[:id].should == "user/1/label/#{folder.title}"
			data[:items].length.should == 15
		end

		it "displays all items" do
			get "/greader/reader/api/0/stream/contents/user/-/state/com.google/reading-list",
				{},
				'HTTP_AUTHORIZATION' => "GoogleLogin auth=#{@token}"

			data = JSON.parse(last_response.body, :symbolize_names => true)

			data[:id].should == "user/1/state/com.google/reading-list"
			data[:items].length.should == 20 # Default limit is 20

			get "/greader/reader/api/0/stream/contents/user/-/state/com.google/reading-list",
				{
					:n => 1000
				},
				'HTTP_AUTHORIZATION' => "GoogleLogin auth=#{@token}"

			data = JSON.parse(last_response.body, :symbolize_names => true)

			data[:id].should == "user/1/state/com.google/reading-list"
			data[:items].length.should == 75
		end

		it "displays favorite items" do
			get "/greader/reader/api/0/stream/contents/user/-/state/com.google/starred",
				{},
				'HTTP_AUTHORIZATION' => "GoogleLogin auth=#{@token}"

			data = JSON.parse(last_response.body, :symbolize_names => true)

			data[:id].should == "user/1/state/com.google/starred"
			data[:items].length.should == 0

			Item.first.update(:favorite => true)

			get "/greader/reader/api/0/stream/contents/user/-/state/com.google/starred",
				{},
				'HTTP_AUTHORIZATION' => "GoogleLogin auth=#{@token}"

			data = JSON.parse(last_response.body, :symbolize_names => true)

			data[:id].should == "user/1/state/com.google/starred"
			data[:items].length.should == 1
		end

		it "displays read items" do
			get "/greader/reader/api/0/stream/contents/user/-/state/com.google/read",
				{},
				'HTTP_AUTHORIZATION' => "GoogleLogin auth=#{@token}"

			data = JSON.parse(last_response.body, :symbolize_names => true)

			data[:id].should == "user/1/state/com.google/read"
			data[:items].length.should == 0

			Item.first.update(:read => true)

			get "/greader/reader/api/0/stream/contents/user/-/state/com.google/read",
				{},
				'HTTP_AUTHORIZATION' => "GoogleLogin auth=#{@token}"

			data = JSON.parse(last_response.body, :symbolize_names => true)

			data[:id].should == "user/1/state/com.google/read"
			data[:items].length.should == 1
		end

		it "can exclude some items" do
			get "/greader/reader/api/0/stream/contents/",
				{
					:n => 1000,
					:xt => "user/-/state/com.google/read"
				},
				'HTTP_AUTHORIZATION' => "GoogleLogin auth=#{@token}"

			data = JSON.parse(last_response.body, :symbolize_names => true)

			data[:id].should == "user/1/state/com.google/reading-list"
			data[:items].length.should == 74

			get "/greader/reader/api/0/stream/contents/",
				{
					:n => 1000,
					:xt => "user/-/state/com.google/starred"
				},
				'HTTP_AUTHORIZATION' => "GoogleLogin auth=#{@token}"

			data = JSON.parse(last_response.body, :symbolize_names => true)

			data[:id].should == "user/1/state/com.google/reading-list"
			data[:items].length.should == 74
		end

		it "can display items in different orders" do
			feed = Feed.first

			get "/greader/reader/api/0/stream/contents/",
				{
					:s => "feed/#{feed.url}",
					:r => 'o'
				},
				'HTTP_AUTHORIZATION' => "GoogleLogin auth=#{@token}"

			data = JSON.parse(last_response.body, :symbolize_names => true)

			data[:id].should == "user/1/state/com.google/reading-list"
			data[:items].length.should == 3
			data[:items][0][:published].should < data[:items][2][:published]
		end

		it "supports continuations" do
			get "/greader/reader/api/0/stream/contents/",
				{
					:n => 50
				},
				'HTTP_AUTHORIZATION' => "GoogleLogin auth=#{@token}"

			data = JSON.parse(last_response.body, :symbolize_names => true)

			data[:items].length.should == 50
			data[:continuation].should == "50"

			get "/greader/reader/api/0/stream/contents/",
				{
					:n => 50,
					:c => data[:continuation]
				},
				'HTTP_AUTHORIZATION' => "GoogleLogin auth=#{@token}"

			data = JSON.parse(last_response.body, :symbolize_names => true)

			data[:items].length.should == 25
			data[:continuation].should be_nil
		end

		it "can filter items using date limits" do
			item = Item.all(:order => [:date.desc])[30]
			puts item.date

			get "/greader/reader/api/0/stream/contents/",
				{
					:n => 1000,
					:nt => item.date.to_time.to_i
				},
				'HTTP_AUTHORIZATION' => "GoogleLogin auth=#{@token}"

			data = JSON.parse(last_response.body, :symbolize_names => true)

			data[:items].length.should == 25

			get "/greader/reader/api/0/stream/contents/",
				{
					:n => 1000,
					:ot => item.date.to_time.to_i
				},
				'HTTP_AUTHORIZATION' => "GoogleLogin auth=#{@token}"

			data = JSON.parse(last_response.body, :symbolize_names => true)

			data[:items].length.should == 25
			data[:continuation].should be_nil
		end
	end

	context "/reader/api/0/stream/items/contents" do
	end

	context "/reader/api/0/stream/items/ids" do
	end

	context "/reader/api/0/edit-tag" do
	end

	after :all do
		Folder.all.destroy
	end
end
