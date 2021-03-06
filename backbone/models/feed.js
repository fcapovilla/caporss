CapoRSS.Model.Feed = Backbone.Model.extend({

	initialize: function() {
		this.items = new CapoRSS.Collection.Item();
		this.items.url = '/api/feed/' + this.id + '/item';

		this.listenTo(this.items, 'itemRead', this.decrementUnreadCount);
		this.listenTo(this.items, 'itemUnread', this.incrementUnreadCount);
	},

	/**
	 * Returns some attributes as JSON.
	 * Only these attributes will be sent to the server when saving the Feed.
	 * @return {Object}
	 */
	toJSON: function() {
		// Syncable attributes
		return {
			position: this.get('position'),
			folder: this.get('folder'),
			folder_id: this.get('folder_id'),
			url: this.get('url'),
			pshb: this.get('pshb'),
			skip_sync: this.get('skip_sync')
		};
	},

	/**
	 * Mark all of the feed's items as read.
	 * @return {Deferred}
	 */
	markRead: function() {
		var that = this;
		return $.ajax({
			method: 'PUT',
			url: '/api/feed/' + this.id,
			data: JSON.stringify({action: 'read'}),
			success: function() {
				that.set('unread_count', 0);
			}
		});
	},

	/**
	 * Mark all of the feed's items as not read.
	 * @return {Deferred}
	 */
	markUnread: function() {
		var that = this;
		return $.ajax({
			method: 'PUT',
			url: '/api/feed/' + this.id,
			data: JSON.stringify({action: 'unread'}),
			success: function() {
				that.fetch();
			}
		});
	},

	/**
	 * Increment unread count
	 */
	incrementUnreadCount: function() {
		this.set('unread_count', this.get('unread_count') + 1);
	},

	/**
	 * Decrement unread count
	 */
	decrementUnreadCount: function() {
		this.set('unread_count', this.get('unread_count') - 1);
	},

	/**
	 * Get next feed/folder in the feed list
	 * @return {(CapoRSS.Model.Folder|CapoRSS.Model.Feed)} The next feed/folder
	 */
	getNextInList: function() {
		var next = this.collection.at(this.collection.indexOf(this) + 1);
		if(next === null || next === undefined) {
			var folder = CapoRSS.folders.get(this.get('folder_id'));
			next = folder.collection.at(folder.collection.indexOf(folder) + 1);
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
		if(prev === null || prev === undefined) {
			prev = CapoRSS.folders.get(this.get('folder_id'));
		}

		if(prev === null || prev === undefined) {
			prev = this;
		}

		return prev;
    },

	/**
	 * Check if the PSHB subscription is expired for this feed.
	 * @return {boolean}
	 */
	isPSHBExpired: function() {
		var expiration = this.get('pshb_expiration');
		if(expiration === null || expiration === undefined) {
			return true;
		}

		var date = new Date(expiration);
		return (date <= Date.now());
	}
});
