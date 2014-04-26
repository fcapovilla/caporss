# encoding: utf-8
# Patch Rack to support repeated query parameters.
# From http://xampl.com/so/2009/12/16/rubyrack-and-multiple-value-request-param-pain-%E2%80%94-part-one/
module Rack
	module Utils

		def normalize_params(params, name, v = nil)
			name =~ %r(\A[\[\]]*([^\[\]]+)\]*)
			k = $1 || ''
			after = $' || ''

			return if k.empty?

			if after == ""
				# The original simply did: params[k] = v
				case params[k]
				when Array
					params[k] << v
				when String
					params[k] = [ params[k], v ]
				else
					params[k] = v
				end
			elsif after == "["
				params[name] = v
			elsif after == "[]"
				params[k] ||= []
				raise TypeError, "expected Array (got #{params[k].class.name}) for param `#{k}'" unless params[k].is_a?(Array)
				params[k] << v
			elsif after =~ %r(^\[\]\[([^\[\]]+)\]$) || after =~ %r(^\[\](.+)$)
				child_key = $1
				params[k] ||= []
				raise TypeError, "expected Array (got #{params[k].class.name}) for param `#{k}'" unless params[k].is_a?(Array)
				if params_hash_type?(params[k].last) && !params[k].last.key?(child_key)
					normalize_params(params[k].last, child_key, v)
				else
					params[k] << normalize_params(params.class.new, child_key, v)
				end
			else
				params[k] ||= params.class.new
				raise TypeError, "expected Hash (got #{params[k].class.name}) for param `#{k}'" unless params_hash_type?(params[k])
				params[k] = normalize_params(params[k], after, v)
			end

			return params
		end
		module_function :normalize_params

	end
end

