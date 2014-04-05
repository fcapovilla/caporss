# encoding: utf-8

# Caching class. Contains variables to keep during server lifetime.
class Cache
	# Connection list for Server-Sent Events
	@@connections = []

	# Concatenated backbone application
	@@backbone = nil

	def self.backbone
		@@backbone
	end

	def self.backbone=(b)
		@@backbone=b
	end

	def self.connections
		@@connections
	end

	def self.addConnection(c)
		@@connections << c
	end

	def self.removeConnection(c)
		@@connections.delete(c)
	end
end
