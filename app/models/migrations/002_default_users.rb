# encoding: utf-8
require 'bcrypt'

Sequel.migration do
	change do
		from(:users).insert(
			:username => 'admin',
			:password_digest => BCrypt::Password.create('admin'),
			:role => 'admin'
		)

		from(:users).insert(
			:username => 'sync',
			:password_digest => BCrypt::Password.create('sync'),
			:role => 'sync'
		)
	end
end
