CapoRSS.Model.AllItemsFolder = Backbone.Model.extend({
	initialize: function() {
		this.items = new CapoRSS.Collection.Item({show_feed_titles: true});
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
		return CapoRSS.folders.first();
    },
	getPreviousInList: function() {
		return this;
    },
	itemRead: function(feed_id) {
		var feed = CapoRSS.folders.getFeed(feed_id);
		if(feed) {
			feed.decrementReadCount();
		}
	},
	itemUnread: function(feed_id) {
		var feed = CapoRSS.folders.getFeed(feed_id);
		if(feed) {
			feed.incrementReadCount();
		}
	}
});
