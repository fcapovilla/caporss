# encoding: utf-8
class Item < Sequel::Model
	many_to_one :user
	many_to_one :feed
end
