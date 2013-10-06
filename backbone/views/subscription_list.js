CapoRSS.View.SubscriptionList = Backbone.Marionette.CompositeView.extend({
	el: $('#subscription-list'),
	template: '#tmpl-subscription-list',
	itemView: CapoRSS.View.Subscription,
	itemViewContainer: 'tbody',
	events: {
		'click .sortable': 'sortColumn'
	},
	collectionEvents: {
		'sort': 'render'
	},

	/**
	 * Data sent to the template.
	 * @return {Object}
	 */
	serializeData: function() {
		return {
			'sortDirection': this.collection.sortDirection,
			'sortAttribute': this.collection.sortAttribute
		};
    },

	/**
	 * Resort the list by the selected column
	 * @param {eventObject} e
	 */
	sortColumn: function(e) {
		var column = $(e.currentTarget).data('column');
		if(column) {
			if(column == this.collection.sortAttribute) {
				this.collection.sortDirection = !this.collection.sortDirection;
			}
			else {
				this.collection.sortDirection = true;
				this.collection.sortAttribute = column;
			}
			this.collection.sort();
		}
	}
});
