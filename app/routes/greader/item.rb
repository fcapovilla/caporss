# encoding: utf-8
# GReader Items

namespace '/greader' do
	namespace '/reader/api/0' do

		before do
			authorize_token! :user
		end

		get '/stream/contents/*' do |target|
			filters = generate_greader_filters(params)

			target_title = nil
			if target
				if target =~ /^feed\/(.*)/
					if feed = Feed.first(:url => $1, :user => @user)
						filters[:feed] = feed
						target_title = filters[:feed].title
					end
				elsif target =~ /^user\/[^\/]*\/label\/(.*)/
					if folder = Folder.first(:title => $1, :user => @user)
						filters[Item.feed.folder_id] = folder.id
						target_title = folder.title
					end
				elsif target =~ /^user\/[^\/]*\/state\/com\.google\/(.*)/
					target_title = $1
				end
			else
				target = "user/#{@user.id}/state/com.google/reading-list"
				target_title = 'reading-list'
			end

			halt 404 if target_title.nil?

			items = get_greader_items(filters)

			output = {
				:direction => 'ltr',
				:id => target,
				:title => target_title,
				:description => '',
				:self => {
					:href => request.url
				},
				:updated => Time.now.to_i, # TODO
				:items => items
			}

			if items.length == filters[:limit]
				output[:continuation] = (filters[:offset] + filters[:limit]).to_s
			end
			output.to_json
		end

		get '/stream/items/contents' do
			filters = generate_greader_filters(params)

			halt 404 unless params[:i]

			filters[:id] = params[:i]

			items = get_greader_items(filters)

			{
				:direction => 'ltr',
				:self => {
					:href => request.url
				},
				:items => items,
			}.to_json
		end

		get '/stream/items/ids' do
			filters = generate_greader_filters(params)
			items = []

			Item.all(filters).each do |item|
				directStreamIds = []
				if params[:includeAllDirectStreamIds] == 'true'
					directStreamIds = item.feed ? ["user/#{@user.id}/label/#{item.feed.folder.title}"] : []
				end

				items << {
					:id => item.id.to_s,
					:directStreamIds => directStreamIds,
					:timestampUsec => (item.date.to_time.to_i * 1000 * 1000).to_s
				}
			end

			output = {
				:itemRefs => items,
			}
			if items.length == filters[:limit]
				output[:continuation] = (filters[:offset] + filters[:limit]).to_s
			end
			output.to_json
		end
	end

	get '/reader/atom' do
		{}.to_json # TODO
	end
end


route :get, :post, '/greader/reader/api/0/edit-tag' do
	item_ids = []
	if params[:i]
		params[:i] = [params[:i]] unless params[:i].is_a? Array
		params[:i].each do |id|
			item_id = id.to_i
			if id =~ /^tag:google\.com,2005:reader\/item\/(.*)/
				item_id = $1.to_i(16)
			end
			item_ids << item_id
		end
	end

	items = Item.all(:id => item_ids, :user => @user)

	if params[:a]
		if params[:a] =~ /^user\/[^\/]*\/state\/com\.google\/(.+)/
			if $1 == 'read'
				items.update(:read => true)
			end
		end
	end

	if params[:r]
		if params[:r] =~ /^user\/[^\/]*\/state\/com\.google\/(.+)/
			if $1 == 'read'
				items.update(:read => false)
			end
		end
	end

	feed_ids = items.map{ |i| i.feed_id }.uniq
	Feed.all(:id => feed_ids).each do |feed|
		feed.update_unread_count!
	end

	'OK'
end
