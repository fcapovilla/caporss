CapoRSS.Collection.Feed = Backbone.Collection.extend({
	model: CapoRSS.Model.Feed,
	url: '/api/feed',

	initialize: function() {
		this.sortAttribute = 'position';
		this.sortDirection = true;
	},

	/**
	 * Comparator to sort feeds by a specific sort attribute
	 * @param {CapoRSS.Model.Feed} a
	 * @param {CapoRSS.Model.Feed} b
	 * @return {number}
	 */
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
