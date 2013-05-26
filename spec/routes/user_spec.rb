require_relative '../spec_helper'

describe "Admin user page" do

	it "can add a new user" do
		post '/login', :username => 'admin', :password => 'admin'
		post '/user', :username => 'user', :password => 'user'
		follow_redirect!
		last_response.body.should =~ /User successfully created/
	end

	it "won't create invalid users" do
		post '/login', :username => 'admin', :password => 'admin'

		post '/user', :username => '', :password => ''
		follow_redirect!
		last_response.body.should_not =~ /User successfully created/

		post '/user', :username => 'test_user_without_password', :password => ''
		follow_redirect!
		last_response.body.should_not =~ /User successfully created/

		post '/user', :username => '', :password => 'no_username'
		follow_redirect!
		last_response.body.should_not =~ /User successfully created/
	end

	it "can modify users" do
		post '/login', :username => 'admin', :password => 'admin'
		id = User.first(:username => 'user').id

		post "/user/#{id}", :username => 'testuser'
		follow_redirect!
		last_response.body.should =~ /User successfully updated/
		User.get(id).username.should == 'testuser'

		post "/user/#{id}", :password => 'testuser'
		follow_redirect!
		last_response.body.should =~ /User successfully updated/
		User.get(id).password.should == 'testuser'
	end

	it "won't modify user using invalid values" do
		post '/login', :username => 'admin', :password => 'admin'
		id = User.first(:username => 'testuser').id

		post "/user/#{id}", :username => ''
		follow_redirect!
		last_response.body.should_not =~ /User successfully updated/
		User.get(id).username.should_not == ''

		post "/user/#{id}", :password => ''
		follow_redirect!
		last_response.body.should_not =~ /User successfully updated/
		User.get(id).password.should_not == ''

		post "/user/#{id}", :username => 'newusername', :password => ''
		follow_redirect!
		last_response.body.should_not =~ /User successfully updated/
		User.get(id).password.should_not == ''

		post "/user/#{id}", :username => '', :password => 'newusername'
		follow_redirect!
		last_response.body.should_not =~ /User successfully updated/
		User.get(id).username.should_not == ''
	end

	it "can delete users" do
		post '/login', :username => 'admin', :password => 'admin'
		id = User.first(:username => 'testuser').id

		delete "/user/#{id}"
        User.get(id).should be_nil
	end

	it "won't delete admin or sync users" do
		post '/login', :username => 'admin', :password => 'admin'

		id = User.first(:roles => [:admin]).id
		delete "/user/#{id}"
		User.get(id).should_not be_nil

		id = User.first(:roles => [:sync]).id
		delete "/user/#{id}"
		User.get(id).should_not be_nil
	end

end
