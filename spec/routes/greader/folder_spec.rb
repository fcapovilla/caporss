require_relative '../../spec_helper'

describe "GReader Folder routes" do
	before :all do
		generate_sample_feeds

		post '/greader/accounts/ClientLogin', :Email => 'admin', :Passwd => 'admin'
		last_response.body =~ /^Auth=(.*)$/
		@token = $1
	end

	context "/reader/api/0/tag/list" do
	end

	context "/reader/api/0/preference/stream/list" do
	end

	context "/reader/api/0/preference/stream/set" do
	end

	context "/reader/api/0/unread-count" do
	end

	context "/reader/api/0/rename-tag" do
	end

	context "/reader/api/0/disable-tag" do
	end

	after :all do
		Folder.all.destroy
	end
end
