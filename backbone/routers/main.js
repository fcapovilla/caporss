CapoRSS.Router.Main = Backbone.Router.extend({
	routes: {
		"": "clear",
		"feed/:id": "viewFeed",
		"folder/:id": "viewFolder",
		"item": "viewAllItems",
		"favorites": "viewFavorites"
	},

	initialize: function() {
		this.itemListRegion = new Backbone.Marionette.Region({
			el: '#item-list'
		});
		this.currentSelection = null;
		this.itemList = null;

		this.filters = {
			query: '',
			search_title: true,
			sort: '',
			show_read: SETTINGS.show_read
		};
	},

	/**
	 * Clear the itemList.
	 */
	clear: function() {
		$('#item-list').scrollTop(0);

		this.itemListRegion.close();

		if(this.currentSelection !== null) {
			this.currentSelection.set('active', false);
			this.currentSelection = null;
		}

		$('.mobile-item-button').addClass('invisible');
		$('#item-list').addClass('hidden-xs');
		$('.feed-list').removeClass('hidden-xs');

		// FIXME: This line is needed to fix scrolling on mobile. A CSS fix would be better.
		$(window).resize();
	},

	/**
	 * Update the itemList with the items of the model in parameter.
	 * @param {(CapoRSS.Model.Folder|CapoRSS.Model.Feed|CapoRSS.Model.AllItemsFolder)} model
	 */
	updateItemList: function(model) {
		var that = this;
		$('#item-list').scrollTop(0);
		this.itemListRegion.close();

		var options = {
			reset: true,
			reset_pagination: true,
			data: _.clone(this.filters),
			success: function() {
				that.itemListRegion.show(that.itemList);
			}
		};

		if(this.currentSelection !== null) {
			this.currentSelection.set('active', false);
			this.currentSelection.items.query = '';
			this.currentSelection.items.sort = '';
			this.currentSelection.items.search_title = false;
		}
		model.set('active', true);
		this.currentSelection = model;

		this.itemList = new CapoRSS.View.ItemList({collection: model.items});
		model.items.fetch(options);

		$('#item-list').removeClass('hidden-xs');
		$('.feed-list').addClass('hidden-xs');
		$('.mobile-item-button').removeClass('invisible');
		$('#item-list').focus();

		// FIXME: This line is needed to fix scrolling on mobile. A CSS fix would be better.
		$(window).resize();
	},

	refreshItemList: function(filters) {
		if(filters !== null) {
			this.filters = _.defaults(filters, this.filters);
		}

		if(this.currentSelection !== null) {
			this.itemList.cursor = null;
			return this.itemList.collection.fetch({
				reset: true,
				reset_pagination: true,
				data: _.clone(this.filters)
			});
		}
	},

	/**
	 * Update the item list using a feed id.
	 * @param {number} id The feed id
	 */
	viewFeed: function(id) {
		var model = CapoRSS.folders.getFeed(id);

		this.updateItemList(model);
	},

	/**
	 * Update the item list using a folder id.
	 * @param {number} id The folder id
	 */
	viewFolder: function(id) {
		var model = CapoRSS.folders.get(id);

		this.updateItemList(model);
	},

	/**
	 * Update the item list using the AllItemFolder.
	 */
	viewAllItems: function() {
		var model = CapoRSS.folderList.allItemsFolder;
		this.updateItemList(model);
	},

	/**
	 * Update the item list using the FavoritesFolder
	 */
	viewFavorites: function() {
		var model = CapoRSS.folderList.favoritesFolder;
		this.updateItemList(model);
	},

	/**
	 * Go to the router url for the model in parameter.
	 * @param {(CapoRSS.Model.Folder|CapoRSS.Model.Feed|CapoRSS.Model.AllItemFolder)} model
	 */
	goToModel: function(model) {
		if(model instanceof CapoRSS.Model.Folder) {
			this.navigate('folder/' + model.id, {trigger: true});
		}
		else if(model instanceof CapoRSS.Model.Feed) {
			this.navigate('feed/' + model.id, {trigger: true});
		}
		else if(model instanceof CapoRSS.Model.AllItemsFolder) {
			this.navigate('item', {trigger: true});
		}
		else if(model instanceof CapoRSS.Model.FavoritesFolder) {
			this.navigate('favorites', {trigger: true});
		}
    }
});
