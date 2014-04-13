CapoRSS.View.Filters = Backbone.Marionette.CompositeView.extend({
	el: $('#filters'),
	template: '#tmpl-filters',
	events: {
		'submit #searchForm': function(){return false;},
		'keyup #searchQuery': 'debouncedChangeSearchFilter',
		'change #sortType': 'changeSearchFilter',
		'click #searchInTitle': 'toggleSearchInTitle'
	},

	initialize: function() {
		this.debouncedChangeSearchFilter = _.debounce(this.changeSearchFilter, 1000);
		this.searchInTitle = true;
	},

	toggleSearchInTitle: function() {
		this.searchInTitle = !this.searchInTitle;

		if(this.searchInTitle) {
			this.$('#searchInTitle>i').removeClass('fa-list-alt').addClass('fa-list');
		}
		else {
			this.$('#searchInTitle>i').removeClass('fa-list').addClass('fa-list-alt');
		}

		this.changeSearchFilter();
	},

	/**
	 * Updates the item list's search filters.
	 */
	changeSearchFilter: function() {
		CapoRSS.router.refreshItemList({
			query: $('#searchQuery').val(),
			search_title: this.searchInTitle,
			sort: $('#sortType').val()
		});

		return false;
	}
});
