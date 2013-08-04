# encoding: utf-8

# Haml partials
def partial(page, options={})
	haml page.to_sym, options.merge!(:layout => false)
end
