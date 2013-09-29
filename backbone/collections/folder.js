var FolderCollection = Backbone.Collection.extend({
	model: Folder,
	url: '/api/folder',
	initialize: function() {
		this.listenTo(this, 'add remove change:unread_count', this.refreshUnreadCount);
	},
	refresh: function() {
		var that = this;
		old_unread_count = this.getUnreadCount();
		this.fetch({
			success: function() {
				new_items = that.getUnreadCount() - old_unread_count;
				if(new_items > 0) {
					$.pnotify({ text: new_items + ' new items.', type: 'success' });
				}
			}
		});
		if(router.currentSelection !== null) {
			router.currentSelection.items.fetch({reset: true});
		}
	},
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

		return deferred;
	},
	refreshUnreadCount: function() {
		var count = this.getUnreadCount();
		document.title = 'CapoRSS (' + count + ')';
		folderList.allItemsFolder.set('unread_count', count);
	},
	getUnreadCount: function() {
		var count = 0;
		this.each(function(folder) {
			count += folder.get('unread_count');
		});
		return count;
	},
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
