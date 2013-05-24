var FolderListView = Backbone.Marionette.CollectionView.extend({
	el: $('#feed-list'),
	itemView: FolderView,
	initialize: function() {
		this.allItemsFolder = new AllItemsFolder();

		this.views = [];
		this.views.push(new SpecialFolderView({model: this.allItemsFolder}));

		this.render();
	},
	onBeforeRender: function() {
		var that = this;
		_.each(this.views, function(view) {
			that.$el.append(view.render().el);
		});
	}
});
