var FeedCollection = Backbone.Collection.extend({
	model: Feed,
	url: '/feed',
	fetch: function(options) {
		var that = this;

		options = options ? options : {};
		var callbacks = _.pick(options, 'success', 'error');
		options = _.omit(options, 'success', 'error');

		var deferred = Backbone.Collection.prototype.fetch.call(this, options);

		$.when(deferred).then(function() {
			var deferreds = that.map(function(feed) {
				return feed.fetchChildren(options);
			});

			$.when.apply($, deferreds).then(callbacks.success, callbacks.error);
		}, callbacks.error);

		return deferred;
	}
});
