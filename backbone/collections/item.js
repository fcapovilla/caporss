var ItemCollection = Backbone.Collection.extend({
	model: Item,
	url: '/item',
	comparator: function(item) {
		return -Date.parse(item.get('date'));
	}
});
