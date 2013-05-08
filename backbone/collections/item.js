var ItemCollection = Backbone.Collection.extend({
	model: Item,
	url: '/item',
	initialize: function(options) {
		this.current_page = 1;
		this.all_loaded = false;

		if(options !== undefined && options.show_feed_titles) {
			this.show_feed_titles = true;
		}
	},
	fetchNextPage: function() {
		if(this.all_loaded) {
			this.trigger('all_items_loaded');
			return false;
		}

		this.current_page++;
		this.fetch({
			data: {offset: (this.current_page-1) * SETTINGS.items_per_page},
			remove: false
		});

		return true;
	},
	fetch: function(options) {
		var that=this;
		var previous_count = this.length;

		if(options.reset_pagination) {
			this.current_page = 1;
			this.all_loaded = false;
			previous_count = 0;
		}

		if(!options.data) {
			options.data = {};
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

		if(!options.data.show_read && !SETTINGS.show_read) {
			options.data.show_read = false;
		}

		var deferred = Backbone.Collection.prototype.fetch.call(this, options);

		$.when(deferred).then(function() {
			if(that.length - previous_count < SETTINGS.items_per_page) {
				that.all_loaded = true;
				that.trigger('all_items_loaded');
			}
			if(that.show_feed_titles) {
				var feed_titles = folders.getFeedTitles();
				that.each(function(item) {
					item.set('feed_title', feed_titles[item.get('feed_id')]);
				});
			}
		});

		return deferred;
	}
});
