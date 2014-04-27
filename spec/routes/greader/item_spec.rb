require_relative '../../spec_helper'

describe "GReader Item routes" do
	before :all do
		generate_sample_feeds

		post '/greader/accounts/ClientLogin', :Email => 'admin', :Passwd => 'admin'
		last_response.body =~ /^Auth=(.*)$/
		@token = $1
	end

	context "/reader/api/0/stream/contents/*" do
	end

	context "/reader/api/0/stream/items/contents" do
	end

	context "/reader/api/0/stream/items/ids" do
	end

	context "/reader/api/0/edit-tag" do
	end

	after :all do
		Folder.all.destroy
	end
end
