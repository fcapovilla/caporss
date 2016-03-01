# encoding: utf-8
# OPML

# Import OPML Files
post '/opml_upload' do
	authorize_basic! :user

	opml = Nokogiri::XML(params[:file][:tempfile].read)
	opml.css('body>outline').each do |root_node|
		# If the root node is a feed, add it to the "Feeds" folder
		if root_node['type'] == 'rss'
			folder = Folder.first_or_create(:user => @user, :title => 'Feeds')
			feed = Feed.new(
				:user => @user,
				:title => root_node['title'],
				:url => root_node['xmlUrl'],
				:last_update => DateTime.new(2000,1,1)
			)
			folder.feeds << feed
			folder.save
		else
			# The root node is a folder. Get all his feeds.
			title = root_node['title'] || root_node['text']
			folder = Folder.first_or_create(:user => @user, :title => title)
			root_node.css('outline').each do |node|
				feed = Feed.new(
					:user => @user,
					:title => node['title'],
					:url => node['xmlUrl'],
					:last_update => DateTime.new(2000,1,1)
				)
				folder.feeds << feed
			end
			folder.save
		end
	end

	flash[:success] = t.flash.opml_import_success.to_s

	redirect '/'
end

# OPML Export
get '/export.opml' do
	authorize_basic! :user

	headers "Content-Disposition" => "attachment;filename=export.opml"
	content_type 'text/x-opml', 'charset' => 'utf-8'

	Nokogiri::XML::Builder.new(:encoding => 'UTF-8') { |xml|
		xml.opml(:version => '1.0') {
			xml.head {
				xml.title "OPML Export"
			}
			xml.body {
				Folder.all(:user => @user).each { |folder|
					xml.__send__ :insert, folder.to_opml
				}
			}
		}
	}.to_xml
end

