require_relative '../spec_helper'

describe "Login page" do

  it "should respond to GET" do
    get '/login'
    last_response.should be_ok
	last_response.body.should =~ /name='username'/
	last_response.body.should =~ /name='password'/
  end

  it "should block bad credentials" do
	  post '/login', :username => 'abcd', :password => 'abcd'
	  last_response.should be_redirect
	  follow_redirect!

	  last_request.url.should =~ /login$/
	  last_response.body.should =~ /Invalid credentials/
  end

  it "should block empty credentials" do
	  post '/login', :username => '', :password => ''
	  last_response.should be_redirect
	  follow_redirect!

	  last_request.url.should =~ /login$/
	  last_response.body.should =~ /Invalid credentials/
  end

  it "should accept good credentials (admin)" do
	  post '/login', :username => 'admin', :password => 'admin'
	  last_response.should be_redirect
	  follow_redirect!

	  last_request.url.should_not =~ /login$/

	  get '/admin'
	  last_response.should_not be_redirect
	  last_response.body.should =~ /Admin/
  end

  it "should log out on logout" do
	  get '/logout'
	  last_response.should be_redirect
	  follow_redirect!

	  last_request.url.should =~ /login$/

	  get '/'
	  last_response.should be_redirect
	  follow_redirect!

	  last_request.url.should =~ /login$/
  end

  it "should redirect to the original page on login" do
	  get '/admin'
	  last_response.should be_redirect
	  follow_redirect!

	  last_request.url.should =~ /login$/

	  post '/login', :username => 'admin', :password => 'admin'
	  last_response.should be_redirect
	  follow_redirect!

	  last_request.url.should =~ /admin$/
  end

end
