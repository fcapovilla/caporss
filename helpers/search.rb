# encoding: utf-8

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

	return options
end
