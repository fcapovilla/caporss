var FolderListView = Backbone.Marionette.CollectionView.extend({
	el: $('#feed-list'),
	itemView: FolderView,
	initialize: function() {
		this.allItemsFolder = new AllItemsFolder();
		this.addSpecialFolders();
	},
	onRender: function() {
		this.addSpecialFolders();
	},
	addSpecialFolders: function() {
		var view = new SpecialFolderView({model: this.allItemsFolder});
		this.$el.append(view.render().el);
	}
});
