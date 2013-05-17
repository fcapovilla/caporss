var Folder = Backbone.Model.extend({
	initialize: function() {
		this.feeds = new FeedCollection();
		this.feeds.url = '/folder/' + this.id + '/feed';
		if(this.get('open')) {
			this.feeds.fetch();
		}

		this.listenTo(this.feeds, 'add remove change:unread_count', this.recalculateReadCount);

		this.items = new ItemCollection({show_feed_titles: true});
		this.items.url = '/folder/' + this.id + '/item';
		this.listenTo(this.items, 'itemRead', this.itemRead);
		this.listenTo(this.items, 'itemUnread', this.itemUnread);
	},
	toggle: function() {
		this.save({open : !this.get('open')});
		if(this.get('open')) {
			this.feeds.fetch();
		}
		else {
			this.feeds.reset();
		}
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
		if(this.get('open')) {
			return this.feeds.fetch(options);
		}
	},
	fetch: function(options) {
		var that = this;

		options = options ? options : {};
		var callbacks = _.pick(options, 'success', 'error');
		options = _.omit(options, 'success', 'error');

		var deferred = Backbone.Collection.prototype.fetch.call(this, options);

		$.when(deferred).then(function() {
			$.when(that.fetchChildren(options)).then(callbacks.success, callbacks.error);
		}, callbacks.error);

		return deferred;
	},
	// Get next feed/folder in the folder list
	getNextInList: function() {
		var next = null;
		if(this.get('open') && this.feeds.length !== 0) {
			next = this.feeds.first();
		}
		else {
			next = this.collection.at(this.collection.indexOf(this) + 1);
		}

		if(next === null || next === undefined) {
			next = this;
		}

		return next;
    },
	// Get previous feed/folder in the folder list
	getPreviousInList: function() {
		var prev = this.collection.at(this.collection.indexOf(this) - 1);
		if(prev !== null && prev !== undefined && prev.get('open') && prev.feeds.length !== 0) {
			prev = prev.feeds.last();
		}

		if(prev === null || prev === undefined) {
			prev = folderList.allItemsFolder;
		}

		return prev;
    }
});
