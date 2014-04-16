# encoding: utf-8

class Hash
	# From "active_support/core_ext/hash"
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

helpers do
	require_relative 'cache'
	require_relative 'partial'
	require_relative 'authorization'
	require_relative 'documentation'
	require_relative 'search'
	require_relative 'stream'
end
