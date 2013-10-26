require 'haml'
require 'r18n-core'

R18n.default_places = 'i18n/'
R18n.set('en')

include R18n::Helpers

module Jasmine
	class Page
		def render
			template = File.read(File.join(File.dirname(__FILE__), "run.html.erb"))
			ERB.new(template).result(@context.instance_eval { binding })
		end
	end

	class Configuration
		def haml(path)
			Haml::Engine.new(File.read(path)).render
		end
	end
end
