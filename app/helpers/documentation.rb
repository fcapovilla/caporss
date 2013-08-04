# encoding: utf-8

def documentation
	root = settings.root + '/doc'
	content = File.open("#{root}/#{@user.default_locale}.textile", 'r').read()
	RedCloth.new(content).to_html
end
