var ItemCollection = Backbone.Collection.extend({
	model: Item,
	url: '/item',
	initialize: function() {
		this.current_page = 1;
		this.all_loaded = false;
	},
	fetchNextPage: function() {
		if(this.all_loaded) {
			return false;
		}

		this.current_page++;
		this.fetch({
			data: {page: this.current_page},
			remove: false
		});

		return true;
	},
	fetch: function(options) {
		if(!options.data) {
			options.data = {};
		}
		if(!options.data.page) {
			this.current_page = 1;
			this.all_loaded = false;
			options.data.page = this.current_page;
		}

		var deferred = Backbone.Collection.prototype.fetch.call(this, options);

		var that=this;
		var previous_count = this.length;
		$.when(deferred).then(function() {
			if(that.length - previous_count < SETTINGS.items_per_page) {
				this.all_loaded = true;
				that.trigger('all_items_loaded');
			}
		});

		return deferred;
	}
});
