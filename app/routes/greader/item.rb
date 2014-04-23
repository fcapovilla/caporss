# encoding: utf-8
# GReader Items

namespace '/greader' do
	namespace '/reader/api/0' do
		get '/stream/contents/*' do |target|
			authorize_token! :user

			filters = {}

			target_title = nil
			if target
				if target =~ /^feed\/(.*)/
					if feed = Feed.first(:url => $1, :user => @user)
						filters[:feed] = feed
						target_title = filters[:feed].title
					end
				elsif target =~ /^label\/(.*)/
					if folder = Folder.first(:title => $1, :user => @user)
						filters[Item.feed.folder_id] = folder.id
						target_title = folder.title
					end
				elsif target =~ /^user\/[^\/]*\/state\/com\.google\/(.*)/
					target_title = $1
				end
			end

			halt 404 if target_title.nil?


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

			if params[:xt] and params[:xt] =~ /user\/[^\/]*\/state\/com\.google\/read/
				filters[:read] = false
			end

			if params[:it]
				# TODO: Include Target
			end

			if params[:c]
				filters[:offset] = params[:c].to_i
			else
				filters[:offset] = 0
			end

			items = []

			Item.all(filters).each do |item|
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

				items << {
					:crawlTimeMsec => (item.date.to_time.to_i * 1000).to_s,
					:timestampUsec => (item.date.to_time.to_i * 1000 * 1000).to_s,
					:id => item.id.to_s,
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

			output = {
				:direction => 'ltr',
				:id => target,
				:title => target_title,
				:description => '',
				:self => {
					:href => request.url
				},
				:updated => Time.now.to_i, # TODO
				:items => items,
			}

			if items.length == filters[:limit]
				output[:continuation] = (filters[:offset] + filters[:limit]).to_s
			end
			output.to_json
		end

		get '/stream/items/contents' do
			{}.to_json # TODO
		end

		get '/stream/items/ids' do
			authorize_token! :user

			filters = {}

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

			if params[:xt] and params[:xt] =~ /user\/[^\/]*\/state\/com\.google\/read/
				filters[:read] = false
			end

			if params[:it]
				# TODO: Include Target
			end

			if params[:c]
				filters[:offset] = params[:c].to_i
			else
				filters[:offset] = 0
			end

			items = []

			Item.all(filters).each do |item|
				items << {
					:id => item.id.to_s,
					:directStreamIds => [
						"user/#{@user.id}/label/#{item.feed.folder.title}"
					],
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
