require_relative '../spec_helper'

describe "Settings route" do

	before :all do
		User.new(
			:username => 'user',
			:password => 'user',
			:roles => [:user]
		).save
	end

	it "blocks access by sync user" do
		authorize 'sync', 'sync'
		post '/save_settings', :cleanup_after => 100
		last_response.status.should == 403
	end

	it "saves settings" do
		authorize 'user', 'user'

		user = User.first(:username => 'user')
		user.cleanup_after.should_not == 100
		user.refresh_timeout.should_not == 30
		user.sync_timeout.should_not == 20
		user.default_locale.should_not == 'fr'
		user.items_per_page.should_not == 10

		post '/save_settings',
			:cleanup_after => 100,
			:refresh_timeout => 30,
			:sync_timeout => 20,
			:default_locale => 'fr',
			:items_per_page => 10
		session[:flash][:success].should == "Settings saved"

		user.reload
		user.cleanup_after.should == 100
		user.refresh_timeout.should == 30
		user.sync_timeout.should == 20
		user.default_locale.should == 'fr'
		user.items_per_page.should == 10

		user.update(:default_locale => 'en')
	end

	it "requires the old password to change password" do
		authorize 'user', 'user'
		user = User.first(:username => 'user')

		user.password.should == 'user'

		post '/save_settings', :new_password => 'test'
		user.reload.password.should_not == 'test'

		post '/save_settings', :old_password => 'user', :new_password => 'user2'
		session[:flash][:success].should == "Settings saved"
		user.reload.password.should == 'user2'

		user.update(:password => 'user')
	end

	it "refuses invalid passwords" do
		authorize 'user', 'user'

		post '/save_settings', :old_password => 'user', :new_password => ''
		session[:flash][:error].should_not be_nil
		User.first(:username => 'user').password.should_not == ''
	end

	it "refuses invalid locales" do
		authorize 'user', 'user'
		user = User.first(:username => 'user')

		user.default_locale.should == 'en'

		post '/save_settings', :default_locale => 'abcde'
		session[:flash][:error].should_not be_nil
		user.reload.default_locale.should_not == 'abcde'

		post '/save_settings', :default_locale => ''
		session[:flash][:error].should_not be_nil
		user.reload.default_locale.should_not == ''

		post '/save_settings', :default_locale => 'enenenen'
		session[:flash][:error].should_not be_nil
		user.reload.default_locale.should_not == 'enenenen'
	end

	it "refuses invalid sync timeouts" do
		authorize 'user', 'user'
		user = User.first(:username => 'user')

		user.sync_timeout.should == 20

		post '/save_settings', :sync_timeout => -1
		session[:flash][:error].should_not be_nil
		user.reload.sync_timeout.should_not == -1

		post '/save_settings', :sync_timeout => 'abc'
		session[:flash][:error].should_not be_nil
		user.reload.sync_timeout.should_not == 'abc'
	end

	it "refuses invalid refresh timeouts" do
		authorize 'user', 'user'
		user = User.first(:username => 'user')

		user.refresh_timeout.should == 30

		post '/save_settings', :refresh_timeout => -1
		session[:flash][:error].should_not be_nil
		user.reload.refresh_timeout.should_not == -1

		post '/save_settings', :refresh_timeout => 'abc'
		session[:flash][:error].should_not be_nil
		user.reload.refresh_timeout.should_not == 'abc'
	end

	it "refuses invalid items per page values" do
		authorize 'user', 'user'
		user = User.first(:username => 'user')

		user.items_per_page.should == 10

		post '/save_settings', :items_per_page => 0
		session[:flash][:error].should_not be_nil
		user.reload.items_per_page.should_not == 0

		post '/save_settings', :items_per_page => -1
		session[:flash][:error].should_not be_nil
		user.reload.items_per_page.should_not == -1

		post '/save_settings', :items_per_page => 'abc'
		session[:flash][:error].should_not be_nil
		user.reload.items_per_page.should_not == 'abc'
	end

	it "refuses invalid cleanup after values" do
		authorize 'user', 'user'
		user = User.first(:username => 'user')

		user.cleanup_after.should == 100

		post '/save_settings', :cleanup_after => 0
		session[:flash][:error].should_not be_nil
		user.reload.cleanup_after.should_not == 0

		post '/save_settings', :cleanup_after => -1
		session[:flash][:error].should_not be_nil
		user.reload.cleanup_after.should_not == -1

		post '/save_settings', :cleanup_after => 'abc'
		session[:flash][:error].should_not be_nil
		user.reload.cleanup_after.should_not == 'abc'
	end

	after :all do
		User.first(:username => 'user').destroy
	end

end
