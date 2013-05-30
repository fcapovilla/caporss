require_relative '../spec_helper'

describe "Folder route" do

	before :all do
		generate_sample_feeds
	end

	it "blocks access by sync user" do
		authorize 'sync', 'sync'
		get '/folder'
		last_response.status.should == 403
	end

	it "lists folders" do
		authorize 'admin', 'admin'
		get '/folder'
		data = JSON.parse(last_response.body, :symbolize_names => true)

		last_response.body.should =~ /Folder 0/
		data.length.should == 5
		data[0][:position].should == 1
		data[4][:position].should == 5
	end

	it "shows folder's informations" do
		authorize 'admin', 'admin'
		folder_id = Folder.first(:title => 'Folder 0').id

		get "/folder/#{folder_id}"
		data = JSON.parse(last_response.body, :symbolize_names => true)

		data[:id].should == folder_id
		data[:title].should == 'Folder 0'
		data[:position].should == 1
		data[:open].should == true
		data[:unread_count].should == 0
		data[:user_id].should == User.first(:username => 'admin').id
	end

	it "lists folder's feeds" do
		authorize 'admin', 'admin'
		folder_id = Folder.first(:title => 'Folder 0').id

		get "/folder/#{folder_id}/feed"
		data = JSON.parse(last_response.body, :symbolize_names => true)

		last_response.body.should =~ /Feed 0/
		data.length.should == 5
		data[0][:position].should == 1
		data[4][:position].should == 5
	end

	it "lists folder's items" do
		authorize 'admin', 'admin'
		folder_id = Folder.first(:title => 'Folder 4').id

		# Need to sync folder before listing
		post "/sync/folder/#{folder_id}"

		get "/folder/#{folder_id}/item"
		data = JSON.parse(last_response.body, :symbolize_names => true)

		data.length.should == 15
		data[0][:title].should == 'Item 2'
		data[4][:title].should == 'Item 2'
		data[5][:title].should == 'Item 1'
	end

	it "opens/closes folders" do
		authorize 'admin', 'admin'
		folder_id = Folder.first(:title => 'Folder 0').id

		put "/folder/#{folder_id}", {:open => false}.to_json
		data = JSON.parse(last_response.body, :symbolize_names => true)
		data[:open].should == false
		Folder.get(folder_id).open.should == false

		put "/folder/#{folder_id}", {:open => true}.to_json
		data = JSON.parse(last_response.body, :symbolize_names => true)
		data[:open].should == true
		Folder.get(folder_id).open.should == true
	end

	it "renames folders" do
		authorize 'admin', 'admin'
		folder_id = Folder.first(:title => 'Folder 0').id

		put "/folder/#{folder_id}", {:title => "FolderTest 0"}.to_json
		last_response.body.should =~ /FolderTest 0/
		Folder.get(folder_id).title.should == "FolderTest 0"
	end

	it "moves folders" do
		authorize 'admin', 'admin'
		folder_id = Folder.first(:title => 'Folder 1').id

		put "/folder/#{folder_id}", {:position => 1}.to_json
		data = JSON.parse(last_response.body, :symbolize_names => true)

		last_response.body.should =~ /Folder 1/
		data[:position].should == 1
		Folder.get(folder_id).position.should == 1
		Folder.first(:title => 'FolderTest 0').position.should == 2
	end

	it "won't create invalid folders" do
		authorize 'admin', 'admin'
		folder_id = Folder.first(:title => 'Folder 2').id

		put "/folder/#{folder_id}", {:title => ""}.to_json
		last_response.status.should == 400
		Folder.get(folder_id).title.should_not == ""

		#put "/folder/#{folder_id}", {:position => "abcd"}.to_json
		#last_response.status.should == 400
		#Folder.get(folder_id).position.should == 3
	end

	it "deletes folders" do
		authorize 'admin', 'admin'
		folder_id = Folder.first(:title => 'Folder 4').id

		delete "/folder/#{folder_id}"
		last_response.status.should == 200

		get '/folder'
		data = JSON.parse(last_response.body, :symbolize_names => true)

		data.length.should == 4
		last_response.should_not =~ /Folder 4/
		Folder.get(folder_id).should be_nil
	end

	it "doesn't respond to POST" do
		authorize 'admin', 'admin'
		post '/folder', :title => 'test'
		last_response.status.should == 404
	end

	after :all do
		Folder.all.destroy
	end

end
