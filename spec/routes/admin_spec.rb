require_relative '../spec_helper'

describe "Admin page" do

	before :all do
		User.new(
			:username => 'user',
			:password => 'user',
			:role => 'user'
		).save
	end

	it "is accessible by admin" do
		post '/login', :username => 'admin', :password => 'admin'

		get '/admin'
		last_response.should_not be_redirect
	end

	it "is not accessible by non-admins" do
		post '/login', :username => 'user', :password => 'user'

		get '/admin'
		last_response.should be_redirect
		follow_redirect!

		last_request.url.should =~ /login$/
	end

	after :all do
		User.first(:username => 'user').destroy
	end

end
