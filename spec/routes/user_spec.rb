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
		User.first(:username => '').should be_nil

		post '/user', :username => 'test_user_without_password', :password => ''
		follow_redirect!
		last_response.body.should_not =~ /User successfully created/
		User.first(:username => 'test_user_without_password').should be_nil

		post '/user', :username => '', :password => 'no_username'
		follow_redirect!
		last_response.body.should_not =~ /User successfully created/
		User.first(:username => '').should be_nil
	end

	it "won't create duplicate users" do
		post '/login', :username => 'admin', :password => 'admin'

		post '/user', :username => 'user', :password => 'user'
		follow_redirect!
		last_response.body.should_not =~ /User successfully created/
		last_response.body.should =~ /Username is already taken/
		User.all(:username => 'user').count.should == 1
	end

	it "can modify users" do
		post '/login', :username => 'admin', :password => 'admin'
		user = User.first(:username => 'user')

		post "/user/#{user.id}", :username => 'testuser'
		follow_redirect!
		last_response.body.should =~ /User successfully updated/
		user.reload.username.should == 'testuser'

		post "/user/#{user.id}", :password => 'testuser'
		follow_redirect!
		last_response.body.should =~ /User successfully updated/
		user.reload.password.should == 'testuser'

		post "/user/#{user.id}", :username => 'testuser2', :password => 'testuser2'
		follow_redirect!
		last_response.body.should =~ /User successfully updated/
		user.reload
		user.username.should == 'testuser2'
		user.password.should == 'testuser2'
	end

	it "won't modify user using invalid values" do
		post '/login', :username => 'admin', :password => 'admin'
		user = User.first(:username => 'testuser2')

		post "/user/#{user.id}", :username => ''
		follow_redirect!
		last_response.body.should_not =~ /User successfully updated/
		user.reload.username.should_not == ''

		post "/user/#{user.id}", :password => ''
		follow_redirect!
		last_response.body.should_not =~ /User successfully updated/
		user.reload.password.should_not == ''

		post "/user/#{user.id}", :username => 'newusername', :password => ''
		follow_redirect!
		last_response.body.should_not =~ /User successfully updated/
		user.reload
		user.username.should_not == 'newusername'
		user.password.should_not == ''

		post "/user/#{user.id}", :username => '', :password => 'newusername'
		follow_redirect!
		last_response.body.should_not =~ /User successfully updated/
		user.reload
		user.username.should_not == ''
		user.password.should_not == 'newusername'
	end

	it "can delete users" do
		post '/login', :username => 'admin', :password => 'admin'
		user = User.first(:username => 'testuser2')

		delete "/user/#{user.id}"
        User.get(user.id).should be_nil
	end

	it "won't delete admin or sync users" do
		post '/login', :username => 'admin', :password => 'admin'
		admin = User.first(:roles => [:admin])
		sync = User.first(:roles => [:sync])

		delete "/user/#{admin.id}"
		User.get(admin.id).should_not be_nil

		delete "/user/#{sync.id}"
		User.get(sync.id).should_not be_nil
	end

end
