# encoding: utf-8
require 'moneta'

# Caching class. Contains variables to keep during server lifetime.
class Cache
	# Connection list for Server-Sent Events (Hash containing Arrays)
	@@connections = {}

	# Concatenated backbone application
	@@backbone = nil

	# Moneta store
	@@store = nil

	def self.store
		@@store
	end

	def self.store=(s)
		@@store=s
	end

	def self.backbone
		@@backbone
	end

	def self.backbone=(b)
		@@backbone=b
	end

	def self.connections(userid=0)
		if userid != 0
			return @@connections[userid]
		else
			return @@connections.values.flatten
		end
	end

	def self.addConnection(userid, c)
		@@connections[userid] = [] unless @@connections[userid]
		@@connections[userid] << c
	end

	def self.removeConnection(userid, c)
		@@connections[userid].delete(c)
	end
end

at_exit do
	Cache::store.close
end
