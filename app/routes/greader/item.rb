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

			puts filters.inspect

			Item.all(filters).each do |item|
				items << {
					:crawlTimeMsec => '', # TODO
					:timestampUsec => '', # TODO
					:id => "tag:google.com,2005:reader/item/#{item.id}",
					:categories => [
						"user/#{@user.id}/label/#{item.feed.folder.title}"
					],
					:title => item.title,
					:published => item.date,
					:updated => item.date,
					:enclosure => [], # TODO: Attachments
					:canonical => [{
						:href => item.url
					}],
					:alternate => [{
						:href => item.url,
						:type => "text/html"
					}],
					:summary => [{
						:direction => 'ltr',
						:content => item.content
					}],
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

			{
				:direction => 'ltr', # TODO
				:id => target,
				:title => target_title,
				:description => '',
				:self => {
					:href => request.url
				},
				:updated => 0, # TODO
				:items => items,
				:continuation => filters[:offset] + filters[:limit]
			}.to_json
		end

		get '/stream/items/contents' do
			{}.to_json # TODO
		end

		get '/stream/items/ids' do
			{}.to_json # TODO
		end
	end

	get '/reader/atom' do
		{}.to_json # TODO
	end
end
