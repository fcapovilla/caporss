# encoding: utf-8

def partial(page, options={})
	haml page.to_sym, options.merge!(:layout => false)
end
