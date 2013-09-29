var SubscriptionListView = Backbone.Marionette.CompositeView.extend({
	el: $('#subscription-list'),
	template: '#tmpl-subscription-list',
	itemView: SubscriptionView,
	itemViewContainer: 'tbody',
	events: {
		'click .sortable': 'sortColumn'
	},
	collectionEvents: {
		'sort': 'render'
	},
	serializeData: function() {
		return {
			'sortDirection': this.collection.sortDirection,
			'sortAttribute': this.collection.sortAttribute
		};
    },

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
