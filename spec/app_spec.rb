require_relative 'spec_helper'

describe "Sinatra App" do

  it "should respond to GET" do
    get '/login'
    last_response.should be_ok
  end

end
