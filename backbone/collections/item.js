var ItemCollection = Backbone.Collection.extend({
	model: Item,
	url: '/item',
	initialize: function(options) {
		this.current_page = 1;
		this.all_loaded = false;

		this.query = '';
		this.sort = '';
		this.search_title = true;

		if(options !== undefined && options.show_feed_titles) {
			this.show_feed_titles = true;
		}
	},
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

		if(options.data.query) {
			this.query = options.data.query;
			this.search_title = (options.data.search_title === true);
		}
		else {
			if(this.query) {
				options.data.query = this.query;
				options.data.search_title = this.search_title;
			}
		}

		if(options.data.sort) {
			this.sort = options.data.sort;
		}
		else {
			if(this.sort) {
				options.data.sort = this.sort;
			}
		}

		if(!options.data.show_read && !SETTINGS.show_read) {
			options.data.show_read = false;
		}

		var deferred = Backbone.Collection.prototype.fetch.call(this, options);

		$.when(deferred).then(function() {
			var new_items = that.length - previous_count;
			if( (that.current_page === 1 && new_items < SETTINGS.items_per_page) ||
				(that.current_page > 1 && new_items === 0)){
				that.all_loaded = true;
				that.trigger('all_loaded');
			}
			if(that.show_feed_titles) {
				var feed_titles = folders.getFeedTitles();
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
