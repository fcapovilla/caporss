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
		Item.first.read.should == true

		put "/item/#{item.id}", {:read => false}.to_json
		data = JSON.parse(last_response.body, :symbolize_names => true)

		data[:read].should == false
		Item.first.read.should == false
	end

	it "won't accept invalid read values" do
		authorize 'admin', 'admin'
		item = Item.first

		put "/item/#{item.id}", {:read => 'test'}.to_json
		last_response.status.should == 400

		Item.first.read.should_not == 'test'
	end

	it "can't change other item informations" do
		authorize 'admin', 'admin'
		item = Item.first
		item.read.should == false

		put "/item/#{item.id}", {:title => 'AAAAA'}.to_json

		last_response.body.should_not =~ /AAAAA/
		Item.first.title.should_not == 'AAAAA'
	end

	after :all do
		Folder.all.destroy
	end

end
