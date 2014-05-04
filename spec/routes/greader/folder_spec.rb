require_relative '../../spec_helper'

describe "GReader Folder routes" do
	before :all do
		generate_sample_feeds

		post '/greader/accounts/ClientLogin', :Email => 'admin', :Passwd => 'admin'
		last_response.body =~ /^Auth=(.*)$/
		@token = $1
	end

	context "/reader/api/0/tag/list" do
		it "lists all folders" do
			get "/greader/reader/api/0/tag/list", nil, 'HTTP_AUTHORIZATION' => "GoogleLogin auth=#{@token}"

			data = JSON.parse(last_response.body, :symbolize_names => true)
			data[:tags].length.should == 5
			data[:tags][0][:id].should == 'user/1/label/Folder 0'
			data[:tags][0][:sortid].should == 1
		end
	end

	context "/reader/api/0/preference/stream/list" do
		it "lists all folders with some of their preferences" do
			folder = Folder.first(:title => 'Folder 0')
			folder.open.should == true

			get "/greader/reader/api/0/preference/stream/list", nil, 'HTTP_AUTHORIZATION' => "GoogleLogin auth=#{@token}"

			data = JSON.parse(last_response.body, :symbolize_names => false)
			data['streamprefs'].keys.length.should == 5
			data['streamprefs']['user/1/label/Folder 0'].length == 2
			data['streamprefs']['user/1/label/Folder 0'][0]['id'].should == 'is-expanded'
			data['streamprefs']['user/1/label/Folder 0'][0]['value'].should == 'true'
			data['streamprefs']['user/1/label/Folder 0'][1]['id'].should == 'subscription-ordering'
			data['streamprefs']['user/1/label/Folder 0'][1]['value'].should == '1'

			folder.update(:open => false)

			get "/greader/reader/api/0/preference/stream/list", nil, 'HTTP_AUTHORIZATION' => "GoogleLogin auth=#{@token}"

			data = JSON.parse(last_response.body, :symbolize_names => false)
			data['streamprefs']['user/1/label/Folder 0'][0]['id'].should == 'is-expanded'
			data['streamprefs']['user/1/label/Folder 0'][0]['value'].should == 'false'
		end
	end

	context "/reader/api/0/preference/stream/set" do
		it "can change a folder's open value" do
			folder = Folder.first(:title => 'Folder 0')
			folder.open.should == false

			post "/greader/reader/api/0/preference/stream/set",
				{
					:s => 'user/-/label/Folder 0',
					:k => 'is-expanded',
					:v => 'true'
				},
				'HTTP_AUTHORIZATION' => "GoogleLogin auth=#{@token}"

			last_response.body.should == 'OK'

			folder.reload
			folder.open.should == true
		end
	end

	context "/reader/api/0/unread-count" do
		it "returns all unread counts" do
			authorize 'admin', 'admin'
			post "/sync/all"

			get "/greader/reader/api/0/unread-count", nil, 'HTTP_AUTHORIZATION' => "GoogleLogin auth=#{@token}"

			data = JSON.parse(last_response.body, :symbolize_names => true)
			data[:max].should == 75
			data[:unreadcounts][0][:id].should == 'user/1/label/Folder 0'
			data[:unreadcounts][0][:count].should == 15
			data[:unreadcounts][0][:newestItemTimestampUsec].to_i.should > 0

			data[:unreadcounts][5][:id].should == 'feed/http://localhost:4567/0.rss?items=3'
			data[:unreadcounts][5][:count].should == 3
			data[:unreadcounts][5][:newestItemTimestampUsec].to_i.should > 0
		end
	end

	context "/reader/api/0/rename-tag" do
		it "renames folders" do
			folder = Folder.first(:title => 'Folder 0')

			post "/greader/reader/api/0/rename-tag",
				{
					:s => 'user/-/label/Folder 0',
					:dest => 'user/-/label/Test'
				},
				'HTTP_AUTHORIZATION' => "GoogleLogin auth=#{@token}"

			last_response.body.should == 'OK'

			folder.reload
			folder.title.should == 'Test'
		end
	end

	context "/reader/api/0/disable-tag" do
		it "deletes folders and move its feeds to the Feeds folder" do
			folder = Folder.first(:title => 'Test')
			folder.feeds.length.should == 5
			Folder.all.count.should == 5

			post "/greader/reader/api/0/disable-tag",
				{
					:s => 'user/-/label/Test'
				},
				'HTTP_AUTHORIZATION' => "GoogleLogin auth=#{@token}"

			last_response.body.should == 'OK'

			Folder.get(folder.id).should be_nil
			feeds_folder = Folder.first(:title => 'Feeds')
			feeds_folder.should_not be_nil
			feeds_folder.feeds.length.should == 5
		end
	end

	after :all do
		Folder.all.destroy
	end
end
