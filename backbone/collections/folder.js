var FolderCollection = Backbone.Collection.extend({
	model: Folder,
	url: '/folder',
	initialize: function() {
		this.listenTo(this, 'add remove change:unread_count', this.refreshUnreadCount);
	},
	fetch: function(options) {
		var res = Backbone.Collection.prototype.fetch.call(this, options);
		options = _.omit(options, 'success', 'error');

		this.each(function(folder) {
			folder.fetchChildren(options);
		});

		return res;
	},
	refreshUnreadCount: function() {
		document.title = 'CapoRSS (' + this.getUnreadCount() + ')';
	},
	getUnreadCount: function() {
		var count = 0;
		this.each(function(folder) {
			count += folder.get('unread_count');
		});
		return count;
	}
});
