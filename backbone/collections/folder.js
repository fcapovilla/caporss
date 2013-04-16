var FolderCollection = Backbone.Collection.extend({
	model: Folder,
	url: '/folder',
	initialize: function() {
		this.listenTo(this, 'add remove change:unread_count', this.recalculateReadCount);
	},
	fetch: function(options) {
		var res = Backbone.Collection.prototype.fetch.call(this, options);

		this.each(function(folder) {
			folder.fetchChildren();
		});

		return res;
	},
	recalculateReadCount: function() {
		var count = 0;
		this.each(function(folder) {
			count += folder.get('unread_count');
		});
		document.title = 'CapoRSS (' + count + ')';
	}
});
