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
		last_response.body.should =~ /CapoRSS\.Router\.Main/
		last_response.body.should =~ /CapoRSS\.Model\.Item/
		last_response.body.should =~ /CapoRSS\.Collection\.Item/
		last_response.body.should =~ /CapoRSS\.View\.Item/
		last_response.body.should =~ /CapoRSS\.View\.ItemList/
	end

end
