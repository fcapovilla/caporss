CapoRSS.Collection.Folder = Backbone.Collection.extend({
	model: CapoRSS.Model.Folder,
	url: '/api/folder',

	initialize: function() {
		this.listenTo(this, 'add remove change:unread_count', this.refreshUnreadCount);
	},

	/**
	 * Comparator to sort folders by position by default
	 * @param {CapoRSS.Model.Folder}
	 * @return {number} position
	 */
	comparator: function(folder) {
		return folder.get('position');
	},

	/**
	 * Fetch updates from the server.
	 * Show a notification if new items were found.
	 * Also updates CapoRSS.subscriptions if the settings dialogs is open.
	 */
	refresh: function() {
		var that = this;
		old_unread_count = this.getUnreadCount();
		this.fetch({
			success: function() {
				new_items = that.getUnreadCount() - old_unread_count;
				if(new_items > 0) {
					new PNotify({ title: LANG.new_items, text: new_items + ' ' + LANG.new_items.toLowerCase(), type: 'success' });
				}
				if($('#settingsModal').is(':visible')) {
					CapoRSS.subscriptions.fetch();
				}
			}
		});
	},

	/**
	 * Fetch folders from the server.
	 * Also fetches feeds for each folder and items for the selected feed.
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
			var deferreds = that.map(function(folder) {
				return folder.fetchChildren(options);
			});

			$.when.apply($, deferreds).then(callbacks.success, callbacks.error);
		}, callbacks.error);

		if(CapoRSS.router.currentSelection !== null) {
			CapoRSS.router.currentSelection.items.fetch({reset: true});
		}

		return deferred;
	},

	/**
	 * Update unread count in the window title and in the "All items" folder.
	 */
	refreshUnreadCount: function() {
		var count = this.getUnreadCount();
		document.title = 'CapoRSS (' + count + ')';
		CapoRSS.folderList.allItemsFolder.set('unread_count', count);
	},

	/**
	 * Get the total number of unread items for all folders.
	 * @return {number} item count
	 */
	getUnreadCount: function() {
		var count = 0;
		this.each(function(folder) {
			count += folder.get('unread_count');
		});
		return count;
	},

	/**
	 * Returns the specified feed by searching it in all the folders.
	 * @param {number} feed id
	 * @return {?CapoRSS.Model.Feed} The feed or null if the feed was not found
	 */
	getFeed: function(id) {
		var feed = null;

		this.every(function(folder) {
			var f = folder.feeds.get(id);
			if(f) {
				feed = f;
				return false;
			}
			return true;
		});

		return feed;
	},

	/**
	 * Get the titles of all feeds
	 * @return {Object.<number, string>} An associative array of feed titles (id -> title)
	 */
	getFeedTitles: function() {
		var feed_titles = {};
		this.each(function(folder) {
			folder.feeds.each(function(feed) {
				feed_titles[feed.id] = feed.get('title');
			});
		});
		return feed_titles;
	}
});
