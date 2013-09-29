var AllItemsFolder = Backbone.Model.extend({
	initialize: function() {
		this.items = new ItemCollection({show_feed_titles: true});
		this.items.url = '/api/item';
		this.listenTo(this.items, 'itemRead', this.itemRead);
		this.listenTo(this.items, 'itemUnread', this.itemUnread);

		this.set({
			name: LANG.all_items_folder,
			route: 'item',
			iconclass: 'icon-asterisk'
		});
	},
	getNextInList: function() {
		return folders.first();
    },
	getPreviousInList: function() {
		return this;
    },
	itemRead: function(feed_id) {
		var feed = folders.getFeed(feed_id);
		if(feed) {
			feed.decrementReadCount();
		}
	},
	itemUnread: function(feed_id) {
		var feed = folders.getFeed(feed_id);
		if(feed) {
			feed.incrementReadCount();
		}
	}
});
