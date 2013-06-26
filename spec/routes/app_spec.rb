require_relative '../spec_helper'

describe "Sinatra application" do

	it 'compiles the sass stylesheet' do
		get '/stylesheet.css'
		last_response.status.should == 200
		last_response.body.should =~ /\.feed-list/
	end

	it 'concatenates all the backbone app files' do
		get '/app.js'
		last_response.status.should == 200
		last_response.body.should =~ /var Router/
		last_response.body.should =~ /var Item/
		last_response.body.should =~ /var ItemCollection/
		last_response.body.should =~ /var ItemView/
		last_response.body.should =~ /var ItemListView/
	end

end
