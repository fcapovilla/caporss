var FolderCollection = Backbone.Collection.extend({
	model: Folder,
	url: '/folder',
	initialize: function() {
		this.listenTo(this, 'add remove change:unread_count', this.refreshUnreadCount);
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
