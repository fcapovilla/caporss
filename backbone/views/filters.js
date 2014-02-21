CapoRSS.View.Filters = Backbone.Marionette.CompositeView.extend({
	el: $('#filters'),
	template: '#tmpl-filters',
	events: {
		'submit #searchForm': function(){return false;},
		'keyup #searchQuery': 'debouncedChangeSearchFilter',
		'change #sortType': 'changeSearchFilter',
		'change #searchInTitle': 'changeSearchFilter'
	},

	initialize: function() {
		this.debouncedChangeSearchFilter = _.debounce(this.changeSearchFilter, 1000);
	},

	/**
	 * Updates the item list's search filters.
	 */
	changeSearchFilter: function() {
		CapoRSS.router.refreshItemList({
			query: $('#searchQuery').val(),
			search_title: $('#searchInTitle').is(':checked'),
			sort: $('#sortType').val()
		});

		return false;
	}
});
