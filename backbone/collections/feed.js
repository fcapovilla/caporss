var FeedCollection = Backbone.Collection.extend({
	model: Feed,
	url: '/feed',
	fetch: function(options) {
		var res = Backbone.Collection.prototype.fetch.call(this, options);
		options = _.omit(options, 'success', 'error');

		this.each(function(feed) {
			feed.fetchChildren(options);
		});

		return res;
	}
});
