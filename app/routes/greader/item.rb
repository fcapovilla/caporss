# encoding: utf-8
# GReader Items

namespace '/greader' do

	helpers do
		def generate_greader_filters(params)
			filters = {:user => @user}

			if params[:n] and params[:n].to_i > 0
				if params[:n].to_i > 1000
					filters[:limit] = 1000
				else
					filters[:limit] = params[:n].to_i
				end
			else
				filters[:limit] = 20
			end

			if params[:r] and params[:r] == 'o'
				filters[:order] = [:date.asc]
			else
				filters[:order] = [:date.desc]
			end

			if params[:ot]
				filters[:date.lt] = params[:ot].to_i
			end

			if params[:nt]
				filters[:date.gt] = params[:nt].to_i
			end

			if params[:s]
				if params[:s] =~ /^feed\/(.*)/
					if feed = Feed.first(:url => $1, :user => @user)
						filters[:feed] = feed
					end
				elsif params[:s] =~ /^user\/[^\/]*\/label\/(.*)/
					if folder = Folder.first(:title => $1, :user => @user)
						filters[Item.feed.folder_id] = folder.id
					end
				elsif params[:s] =~ /user\/[^\/]*\/state\/com\.google\/read/
					filters[:read] = true
				end
			end

			if params[:xt] and params[:xt] =~ /user\/[^\/]*\/state\/com\.google\/read/
				filters[:read] = false
			end

			if params[:c]
				filters[:offset] = params[:c].to_i
			else
				filters[:offset] = 0
			end

			return filters
		end

		def get_greader_items(filters)
			Item.all(filters).map do |item|
				categories = [
					"user/#{@user.id}/state/com.google/reading-list",
					"user/#{@user.id}/label/#{item.feed.folder.title}"
				]
				if item.read
					categories << "user/#{@user.id}/state/com.google/read"
				else
					categories << "user/#{@user.id}/state/com.google/fresh"
				end

				enclosure = []
				if item.medias
					enclosure += item.medias.map { |k,v|
						{
							:href => v,
							:type => k,
							:length => 99999
						}
					}
				end
				if item.attachment_url
					enclosure += [{
						:href => item.attachment_url,
						:type => 'application/octet-stream',
						:length => 99999
					}]
				end

				{
					:crawlTimeMsec => (item.date.to_time.to_i * 1000).to_s,
					:timestampUsec => (item.date.to_time.to_i * 1000 * 1000).to_s,
					:id => "tag:google.com,2005:reader/item/#{item.id.to_s(16).rjust(16,'0')}",
					:categories => categories,
					:title => item.title,
					:published => item.date.to_time.to_i,
					:updated => item.date.to_time.to_i,
					:enclosure => enclosure,
					:canonical => [{
						:href => item.url
					}],
					:alternate => [{
						:href => item.url,
						:type => "text/html"
					}],
					:summary => {
						:direction => 'ltr',
						:content => item.content
					},
					:author => '',
					:likingUsers => [],
					:comments => [],
					:annotations => [],
					:origin => {
						:streamId => "feed/#{item.feed.url}",
						:title => item.feed.title,
						:htmlUrl => item.feed.url
					}
				}
			end
		end
	end

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
					directStreamIds = ["user/#{@user.id}/label/#{item.feed.folder.title}"]
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
	item_id = params[:i].to_i
	if params[:i] =~ /^tag:google\.com,2005:reader\/item\/(.*)/
		item_id = $1.to_i(16)
	end

	item = Item.first(:id => item_id, :user => @user)

	if params[:a]
		if params[:a] =~ /^user\/[^\/]*\/state\/com\.google\/(.+)/
			if $1 == 'read'
				item.update(:read => true)
			end
		end
	end

	if params[:r]
		if params[:r] =~ /^user\/[^\/]*\/state\/com\.google\/(.+)/
			if $1 == 'read'
				item.update(:read => false)
			end
		end
	end

	'OK'
end
