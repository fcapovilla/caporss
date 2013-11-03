CapoRSS.Model.Folder = Backbone.Model.extend({

	initialize: function() {
		this.feeds = new CapoRSS.Collection.Feed();
		this.feeds.url = '/api/folder/' + this.id + '/feed';

		this.listenTo(this.feeds, 'add remove change:unread_count', this.recalculateReadCount);

		this.items = new CapoRSS.Collection.Item({show_feed_titles: true});
		this.items.url = '/api/folder/' + this.id + '/item';
		this.listenTo(this.items, 'itemRead', this.onItemRead);
		this.listenTo(this.items, 'itemUnread', this.onItemUnread);
	},

	/**
	 * Close/Open folder
	 */
	toggle: function() {
		this.save({open : !this.get('open')});
	},

	/**
	 * Returns some attributes as JSON.
	 * Only these attributes will be sent to the server when saving the Folder.
	 * @return {Object}
	 */
	toJSON: function() {
		return {
			open: this.get('open'),
			title: this.get('title'),
			position: this.get('position')
		};
	},

	/**
	 * Action when one of the folder's items is read.
	 * Updates unread count for the specified feed.
	 * @param {number} The id of the feed.
	 */
	onItemRead: function(feed_id) {
		this.feeds.get(feed_id).decrementUnreadCount();
	},

	/**
	 * Action when one of the folder's items is unread.
	 * Updates unread count for the specified feed.
	 * @param {number} The id of the feed.
	 */
	onItemUnread: function(feed_id) {
		this.feeds.get(feed_id).incrementUnreadCount();
	},

	/**
	 * Update the folder's unread count using its feeds' unread count.
	 */
	recalculateReadCount: function() {
		var count = 0;
		this.feeds.each(function(feed) {
			count += feed.get('unread_count');
		});
		this.set('unread_count', count);
	},

	/**
	 * Fetch all of the folder's feeds.
	 * @param {?Object} options
	 * @return {Deferred}
	 */
	fetchChildren: function(options) {
		return this.feeds.fetch(options);
	},

	/**
	 * Fetch the folder and its feeds.
	 * @param {?Object} options
	 * @return {Deferred}
	 */
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

	/**
	 * Get next feed/folder in the feed list
	 * @return {(CapoRSS.Model.Folder|CapoRSS.Model.Feed)} The next feed/folder
	 */
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

	/**
	 * Get previous feed/folder in the feed list
	 * @return {(CapoRSS.Model.Folder|CapoRSS.Model.Feed)} The previous feed/folder
	 */
	getPreviousInList: function() {
		var prev = this.collection.at(this.collection.indexOf(this) - 1);
		if(prev !== null && prev !== undefined && prev.get('open') && prev.feeds.length !== 0) {
			prev = prev.feeds.last();
		}

		if(prev === null || prev === undefined) {
			prev = CapoRSS.folderList.allItemsFolder;
		}

		return prev;
    }
});
