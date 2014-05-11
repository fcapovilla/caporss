# encoding: utf-8
# Favorites

# Import json favorites file
post '/favorites_upload' do
	authorize_basic! :user

	json = JSON.parse(params[:file][:tempfile].read, :symbolize_names => true)

	json[:items].each do |data|
		item = Item.new(
			:user => @user,
			:title => data[:title] || '...',
			:content => '',
			:date => Time.at(data[:published]).getutc.to_datetime || DateTime.now,
			:guid => DateTime.now,
			:url => '',
			:favorite => true
		)

		if data[:content]
			item.content = data[:content][:content]
		elsif data[:summary]
			item.content = data[:summary][:content]
		end

		if data[:canonical]
			item.url = data[:canonical][0][:href]
		elsif data[:alternate]
			item.url = data[:alternate][0][:href]
		end

		if data[:categories]
			data[:categories].each do |cat|
				if cat =~ /\/state\/com\.google\/read$/
					item.read = true
				end
			end
		end

		if data[:enclosure]
			medias = {}
			data[:enclosure].each do |enclosure|
				medias[enclosure[:type]] = enclosure[:href]
			end
			item.medias = medias
		end

		if feed = Feed.first(:url => data[:origin][:streamId][5..-1], :user => @user)
			if existing = feed.items.first(:url => item.url, :title => item.title)
				existing.update(:favorite => true)
			else
				feed.items << item
				feed.save
			end
		else
			item.orig_feed_title = data[:origin][:title]
			item.save
		end
	end

	flash[:success] = t.flash.favorites_import_success

	redirect '/'
end

# Export JSON file (GReader clone)
get '/favorites.json' do
	authorize_basic! :user

	headers "Content-Disposition" => "attachment;filename=favorites.json"
	content_type 'application/json', 'charset' => 'utf-8'

	JSON.pretty_generate({
		:direction => 'ltr',
		:title => 'Favorites',
		:items => get_greader_items(:favorite => true, :user => @user)
	})
end

# Export HTML file (Browser bookmarks format)
get '/favorites.html' do
	authorize_basic! :user

	headers "Content-Disposition" => "attachment;filename=favorites.html"
	content_type 'text/html', 'charset' => 'utf-8'

	output = '<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
'

	Item.all(:user => @user, :favorite => true).each do |item|
		output += "<DT><A HREF=\"#{item.url}\" ADD_DATE=\"#{item.date.to_time.to_i}\">#{item.title}</A>\n"
	end

	output += '</DL><p>'
end

# Add custom favorite
post "/favorite" do
	title = http_get_title(params[:url]) || params[:url]

	item = Item.create(
		:url => params[:url],
		:title => title,
		:favorite => true,
		:date => DateTime.now,
		:user => @user
	)

	item.to_json
end
