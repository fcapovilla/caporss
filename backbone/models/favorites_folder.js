CapoRSS.Model.FavoritesFolder = Backbone.Model.extend({

	initialize: function() {
		this.items = new CapoRSS.Collection.Item({show_feed_titles: true, favorites: true});
		this.items.url = '/api/item';
		this.listenTo(this.items, 'itemRead', this.onItemRead);
		this.listenTo(this.items, 'itemUnread', this.onItemUnread);

		this.set({
			name: LANG.favorites,
			route: 'favorites',
			iconclass: 'fa-star'
		});
	},

	/**
	 * Get next feed/folder in the feed list (In this case, the first folder)
	 * @return {CapoRSS.Model.Folder} The first folder
	 */
	getNextInList: function() {
		return CapoRSS.folders.first();
    },

	/**
	 * Get previous feed/folder in the feed list
	 * @return {CapoRSS.Model.AllItemsFolder} The "All Items" folder
	 */
	getPreviousInList: function() {
		return CapoRSS.folderList.allItemsFolder;
    },

	/**
	 * Action when an item is read for this folder.
	 * Updates unread count.
	 * @param {number} The id of the feed where an item was read
	 */
	onItemRead: function(feed_id) {
		var feed = CapoRSS.folders.getFeed(feed_id);
		if(feed) {
			feed.decrementUnreadCount();
		}
	},

	/**
	 * Action when an item is unread for this folder.
	 * Updates unread count.
	 * @param {number} The id of the feed where an item was unread
	 */
	onItemUnread: function(feed_id) {
		var feed = CapoRSS.folders.getFeed(feed_id);
		if(feed) {
			feed.incrementUnreadCount();
		}
	}
});
