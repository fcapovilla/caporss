# encoding: utf-8

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
		filters[:date.lt] = Time.at(params[:ot].to_i).getutc.to_datetime
	end

	if params[:nt]
		filters[:date.gt] = Time.at(params[:nt].to_i).getutc.to_datetime
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
		elsif params[:s] =~ /user\/[^\/]*\/state\/com\.google\/starred/
			filters[:favorite] = true
		end
	end

	if params[:xt]
		if params[:xt] =~ /user\/[^\/]*\/state\/com\.google\/read/
			filters[:read] = false
		elsif params[:xt] =~ /user\/[^\/]*\/state\/com\.google\/starred/
			filters[:favorite] = false
		end
	end

	if params[:c]
		filters[:offset] = params[:c].to_i
	else
		filters[:offset] = 0
	end

	return filters
end

def get_greader_items(user, filters)
	Item.all(filters).map do |item|
		categories = [
			"user/#{user.id}/state/com.google/reading-list",
		]
		if item.feed
			categories << "user/#{user.id}/label/#{item.feed.folder.title}"
		end
		if item.read
			categories << "user/#{user.id}/state/com.google/read"
		else
			categories << "user/#{user.id}/state/com.google/fresh"
		end
		if item.favorite
			categories << "user/#{user.id}/state/com.google/starred"
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
				:streamId => "feed/#{item.feed ? item.feed.url : ''}",
				:title => item.feed ? item.feed.title : item.orig_feed_title,
				:htmlUrl => item.feed ? item.feed.url : ''
			}
		}
	end
end
