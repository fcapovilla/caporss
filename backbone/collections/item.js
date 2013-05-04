var ItemCollection = Backbone.Collection.extend({
	model: Item,
	url: '/item',
	initialize: function() {
		this.current_page = 1;
		this.all_loaded = false;
	},
	fetchNextPage: function() {
		if(this.all_loaded) {
			that.trigger('all_items_loaded');
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
				previous_count = 0;
				options.data.limit = SETTINGS.items_per_page * this.current_page;
			}
		}

		var deferred = Backbone.Collection.prototype.fetch.call(this, options);

		$.when(deferred).then(function() {
			if(that.length - previous_count < SETTINGS.items_per_page) {
				that.all_loaded = true;
				that.trigger('all_items_loaded');
			}
		});

		return deferred;
	}
});
