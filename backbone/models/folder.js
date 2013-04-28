var Folder = Backbone.Model.extend({
	initialize: function() {
		this.feeds = new FeedCollection();
		this.feeds.url = '/folder/' + this.id + '/feed';
		this.feeds.fetch();

		this.listenTo(this.feeds, 'add remove change:unread_count', this.recalculateReadCount);

		this.items = new ItemCollection();
		this.items.url = '/folder/' + this.id + '/item';
		this.listenTo(this.items, 'itemRead', this.itemRead);
		this.listenTo(this.items, 'itemUnread', this.itemUnread);
	},
	toggle: function() {
		this.save({open : !this.get('open')});
	},
	toJSON: function() {
		return {open: this.get('open'), title: this.get('title')};
	},
	itemRead: function(feed_id) {
		this.feeds.get(feed_id).decrementReadCount();
	},
	itemUnread: function(feed_id) {
		this.feeds.get(feed_id).incrementReadCount();
	},
	recalculateReadCount: function() {
		var count = 0;
		this.feeds.each(function(feed) {
			count += feed.get('unread_count');
		});
		this.set('unread_count', count);
	},
	fetchChildren: function(options) {
		options = options ? options : {};
		var callbacks = _.pick(options, 'success', 'error');
		options = _.omit(options, 'success', 'error');

		var deferreds = []
		if(this.get('active')) {
			deferreds.push( this.items.fetch(options) );
		}
		deferreds.push( this.feeds.fetch(options) );

		var deferred = $.when.apply($, deferreds);
		deferred.then(callbacks.success, callbacks.error);

		return deferred;
	},
	fetch: function(options) {
		options = options ? options : {};
		var callbacks = _.pick(options, 'success', 'error');
		options = _.omit(options, 'success', 'error');

		var deferred = Backbone.Collection.prototype.fetch.call(this, options);

		$.when(deferred).then(function() {
			$.when(this.fetchChildren(options)).then(callbacks.success, callbacks.error);
		}, callbacks.error);

		return deferred;
	}
});
