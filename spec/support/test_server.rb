# encoding: utf-8
require 'sinatra/base'
require 'nokogiri'

class TestServer < Sinatra::Base
	disable :logging
	set :server, 'thin'
	set :public_folder, Proc.new { File.join(root, "static") }

	get '/*.rss' do
		items = params[:items] || 1
		items = items.to_i
		title = params[:title] || 'Test title'

		content_type 'application/rss+xml', 'charset' => 'utf-8'

		builder = Nokogiri::XML::Builder.new do |xml|
			xml.rss :version => "2.0" do
				xml.channel do
					xml.title title
					xml.description "Description - #{title}"
					xml.link request.url
					if params[:pshb]
						xml.link :rel => 'self', :href => "#{request.url}"
						xml.link :rel => 'hub', :href => uri('/pshb/hub')
					end
					items.times do |i|
						xml.item do
							xml.title "Item #{i}"
							xml.link request.url
							xml.description "Description - Item #{i}"
							xml.pubDate DateTime.new(DateTime.now.year-1+i,1,1,1).rfc822
							xml.guid i.to_s
						end
					end
				end
			end
		end

		builder.to_xml
	end

	post '/pshb/hub' do
		202
	end

end
