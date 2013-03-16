# encoding: utf-8
require 'sinatra'
require 'haml'
require 'sass'

require_relative 'models/init'

before do
    content_type :html, 'charset' => 'utf-8'
end

get '/stylesheet.css' do
    content_type :css, 'charset' => 'utf-8'
    sass :stylesheet
end

get '/' do
    haml :index
end

get '/note' do
    @notes = Note.all
end

get '/note/:id' do |id|
    @note = Note.get(id)
end

post '/note' do
    note = Note.new(params[:note])
    note.created_at = Time.now
    note.save
end

delete '/note/:id' do |id|
	Note.get(id).destroy
end
