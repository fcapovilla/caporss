# encoding: utf-8
# Add new methods to Hash
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
