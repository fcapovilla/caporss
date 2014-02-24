CapoRSS.Collection.Item = Backbone.Collection.extend({
	model: CapoRSS.Model.Item,
	url: '/api/item',

	initialize: function(options) {
		this.current_page = 1;
		this.all_loaded = false;

		this.default_filters = {
			query: '',
			sort: '',
			search_title: true,
			show_read: true
		};
		this.filters = this.default_filters;

		if(options !== undefined && options.show_feed_titles) {
			this.show_feed_titles = true;
		}
	},

	/**
	 * Fetch a new page from the server.
	 * @param {?Object} options
	 * @return {boolean} true if the next page was fetched
	 */
	fetchNextPage: function(options) {
		if(this.all_loaded) {
			return false;
		}

		this.current_page++;

		options || (options = {});
		options.data = {offset: (this.current_page-1) * SETTINGS.items_per_page};
		options.remove = false;

		this.fetch(options);

		return true;
	},

	/**
	 * Fetch items with additional options for search, sorting and pagination.
	 * @param {?Object} options
	 * @return {Deferred}
	 */
	fetch: function(options) {
		var that=this;
		var previous_count = this.length;

		options || (options = {});
		options.data || (options.data = {});

		if(options.reset_pagination) {
			this.current_page = 1;
			this.all_loaded = false;
			previous_count = 0;
		}

		if(!options.data.limit) {
			if(options.data.offset) {
				options.data.limit = SETTINGS.items_per_page;
			}
			else {
				this.all_loaded = false;
				previous_count = SETTINGS.items_per_page * (this.current_page-1);
				options.data.limit = SETTINGS.items_per_page * this.current_page;
			}
		}

		options.data = _.defaults(options.data, this.filters);
		this.filters = _.pick(options.data, _.keys(this.filters));

		// Clean data
		_.each(this.default_filters, function(val, key) {
			if(options.data[key] === val) {
				delete options.data[key];
			}
		});

		var deferred = Backbone.Collection.prototype.fetch.call(this, options);

		$.when(deferred).then(function() {
			var new_items = that.length - previous_count;
			if( (that.current_page === 1 && new_items < SETTINGS.items_per_page) ||
				(that.current_page > 1 && new_items === 0)){
				that.all_loaded = true;
				that.trigger('all_loaded');
			}
			if(that.show_feed_titles) {
				var feed_titles = CapoRSS.folders.getFeedTitles();
				that.each(function(item) {
					if(!item.has('feed_title')) {
						item.set('feed_title', feed_titles[item.get('feed_id')]);
					}
				});
			}
		});

		return deferred;
	}
});
