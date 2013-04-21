var Folder = Backbone.Model.extend({
	initialize: function() {
		this.set('active', false);

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
		if(this.get('active')) {
			this.items.fetch(options);
		}

		this.feeds.fetch(options);
	},
	fetch: function(options) {
		var res = Backbone.Collection.prototype.fetch.call(this, options);
		options = _.omit(options, 'success', 'error');

		this.fetchChildren(options);

		return res;
	}
});
