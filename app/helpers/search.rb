# encoding: utf-8

# Convert parameters sent by the client into an item search query
def prepare_item_search(params)
	options = {
		:user => @user,
		:order => [:date.desc],
		:offset => params[:offset].to_i || 0
	}
	options[:limit] = params[:limit].to_i unless params[:limit].nil?
	options[:read] = false if params[:show_read] == 'false'

	unless params[:query].nil?
		if params[:search_title] == 'true'
			options[:title.like] = "%#{params[:query]}%"
		else
			options[:content.like] = "%#{params[:query]}%"
		end
	end

	unless params[:sort].nil?
		case params[:sort]
		when 'dateAsc'
			options[:order] = [:date.asc]
		when 'dateDesc'
			options[:order] = [:date.desc]
		when 'titleAsc'
			options[:order] = [:title.asc]
		when 'titleDesc'
			options[:order] = [:title.desc]
		end
	end

	return options
end
