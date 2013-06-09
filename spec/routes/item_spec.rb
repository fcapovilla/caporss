require_relative '../spec_helper'

describe "Item route" do

	before :all do
		generate_sample_feeds

		authorize 'admin', 'admin'
		post '/sync/all'
	end

	it "lists all items" do
		authorize 'admin', 'admin'

		get "/item"
		data = JSON.parse(last_response.body, :symbolize_names => true)

		last_response.body.should =~ /Item 1/
		data.length.should == 75
	end

	it "filters items" do
		authorize 'admin', 'admin'

		Item.first.update(:read => true)

		get "/item", :limit => 5
		data = JSON.parse(last_response.body, :symbolize_names => true)

		data.length.should == 5

		get "/item", :offset => 5, :limit => 100
		data = JSON.parse(last_response.body, :symbolize_names => true)

		data.length.should == 70

		get "/item", :query => 'Item 0', :search_title => 'true'
		data = JSON.parse(last_response.body, :symbolize_names => true)

		data.length.should == 25
		data[0][:title].should == 'Item 0'

		get "/item", :query => 'Description - Item 0'
		data = JSON.parse(last_response.body, :symbolize_names => true)

		data.length.should == 25
		data[0][:content].should == 'Description - Item 0'

		get "/item", :show_read => 'false'
		data = JSON.parse(last_response.body, :symbolize_names => true)

		data.length.should ==74

		Item.first.update(:read => false)
	end

	it "fetches single items" do
		authorize 'admin', 'admin'

		item = Item.first

		get "/item/#{item.id}"
		data = JSON.parse(last_response.body, :symbolize_names => true)

		data[:title].should == item.title
		data[:id].should == item.id
	end

	it "marks items read/unread" do
		authorize 'admin', 'admin'
		item = Item.first
		item.read.should == false

		put "/item/#{item.id}", {:read => true}.to_json
		data = JSON.parse(last_response.body, :symbolize_names => true)

		data[:read].should == true
		item.reload.read.should == true

		put "/item/#{item.id}", {:read => false}.to_json
		data = JSON.parse(last_response.body, :symbolize_names => true)

		data[:read].should == false
		item.reload.read.should == false
	end

	it "won't accept invalid read values" do
		authorize 'admin', 'admin'
		item = Item.first

		put "/item/#{item.id}", {:read => 'test'}.to_json
		last_response.status.should == 400

		item.reload.read.should_not == 'test'
	end

	it "can't change other item informations" do
		authorize 'admin', 'admin'
		item = Item.first
		item.read.should == false

		put "/item/#{item.id}", {:title => 'AAAAA'}.to_json

		last_response.body.should_not =~ /AAAAA/
		item.reload.title.should_not == 'AAAAA'
	end

	after :all do
		Folder.all.destroy
	end

end
