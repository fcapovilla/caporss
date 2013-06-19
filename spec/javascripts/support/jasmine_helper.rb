module Jasmine
	class Page
		def render
			template = File.read(File.join(File.dirname(__FILE__), "run.html.erb"))
			ERB.new(template).result(@context.instance_eval { binding })
		end
	end
end
