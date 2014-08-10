CapoRSS.View.FolderList = Backbone.Marionette.CollectionView.extend({
	el: $('#feed-list'),
	childView: CapoRSS.View.Folder,
	collectionEvents: {
		'sort': 'render'
	},

	initialize: function() {
		this.allItemsFolder = new CapoRSS.Model.AllItemsFolder();
		this.favoritesFolder = new CapoRSS.Model.FavoritesFolder();

		this.views = [];
		this.views.push(new CapoRSS.View.SpecialFolder({model: this.allItemsFolder}));
		this.views.push(new CapoRSS.View.SpecialFolder({model: this.favoritesFolder}));

		this.render();
	},

	/**
	 * Action before the folderList render.
	 */
	onBeforeRender: function() {
		var that = this;
		_.each(this.views, function(view) {
			that.$el.append(view.render().el);
		});
	}
});
