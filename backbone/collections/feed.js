var FeedCollection = Backbone.Collection.extend({
	model: Feed,
	url: '/feed',
	fetch: function(options) {
		var res = Backbone.Collection.prototype.fetch.call(this, options);

		this.each(function(feed) {
			feed.fetchChildren();
		});

		return res;
	}
});
