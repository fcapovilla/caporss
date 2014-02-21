CapoRSS.View.Filters = Backbone.Marionette.CompositeView.extend({
	el: $('#filters'),
	template: '#tmpl-filters',
	events: {
		'click #searchButton': 'changeSearchFilter',
		'change #sortType': 'changeSearchFilter',
		'change #searchInTitle': 'changeSearchFilter'
	},

	changeSearchFilter: function() {
		CapoRSS.router.refreshItemList({
			query: $('#searchQuery').val(),
			search_title: $('#searchInTitle').is(':checked'),
			sort: $('#sortType').val()
		});

		return false;
	}
});
