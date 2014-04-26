# encoding: utf-8

# From "active_support/core_ext/hash"
class Hash
	def slice(*keys)
		keys = keys.map! { |key| convert_key(key) } if respond_to?(:convert_key, true)
		hash = self.class.new
		keys.each { |k| hash[k] = self[k] if has_key?(k) }
		hash
	end
end

def Hash.from_pairs(keys,values)
	hash = {}
	keys.size.times { |i| hash[ keys[i] ] = values[i] }
	hash
end

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


helpers do
	require_relative 'cache'
	require_relative 'partial'
	require_relative 'authorization'
	require_relative 'documentation'
	require_relative 'search'
	require_relative 'stream'
end
