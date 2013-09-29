var FeedCollection = Backbone.Collection.extend({
	model: Feed,
	url: '/api/feed',
	initialize: function() {
		this.sortAttribute = 'position';
		this.sortDirection = true;
	},
	comparator: function(a,b) {
		a = a.get(this.sortAttribute);
        b = b.get(this.sortAttribute);

		if (a === b) {
			return 0;
		}

		if (this.sortDirection) {
			return a > b ? 1 : -1;
		} else {
			return a < b ? 1 : -1;
		}
	}
});
