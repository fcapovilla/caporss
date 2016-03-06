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

	flash[:success] = t.flash.favorites_import_success.to_s

	redirect '/'
end

# Export JSON file (GReader clone)
get '/favorites.json' do
	authorize_basic! :user

	headers "Content-Disposition" => "attachment;filename=favorites.json"
	content_type 'application/json', 'charset' => 'utf-8'

	export_favorites_json @user
end

# Export HTML file (Browser bookmarks format)
get '/favorites.html' do
	authorize_basic! :user

	headers "Content-Disposition" => "attachment;filename=favorites.html"
	content_type 'text/html', 'charset' => 'utf-8'

	export_favorites_html @user
end

# Add custom favorite
post "/favorite" do
	title = http_get_title(params[:url]) || params[:url]

	item = Item.create(
		:url => params[:url],
		:title => title,
		:favorite => true,
		:date => DateTime.now,
		:user => @user,
		:read => true
	)

	item.to_json
end
