CapoRSS.Router.Main = Backbone.Router.extend({
	routes: {
		"": "clear",
		"feed/:id(/search/*query)": "viewFeed",
		"folder/:id(/search/*query)": "viewFolder",
		"item(/search/*query)": "viewAllItems"
	},

	initialize: function() {
		this.itemListRegion = new Backbone.Marionette.Region({
			el: '#item-list'
		});
		this.currentSelection = null;
		this.itemList = null;
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
	},

	/**
	 * Update the itemList with the items of the model in parameter.
	 * @param {(CapoRSS.Model.Folder|CapoRSS.Model.Feed|CapoRSS.Model.AllItemsFolder)} model
	 * @param {?string} query The query part of the router URL
	 */
	updateItemList : function(model, query) {
		var that = this;
		$('#item-list').scrollTop(0);
		this.itemListRegion.close();

		var options = {
			reset: true,
			reset_pagination: true,
			success: function() {
				that.itemListRegion.show(that.itemList);
			}
		};

		// Prepare search query
		if(query !== null) {
			var parts = query.split('/');
			options.data = {};
			options.data.query = parts.pop();

			if(parts.indexOf('title') != -1) {
				options.data.search_title = true;
			}

			_.each(['dateAsc', 'titleAsc', 'titleDesc'], function(val) {
				if(parts.indexOf(val) != -1) {
					options.data.sort = val;
				}
			});
		}

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
	},

	/**
	 * Update the item list using a feed id.
	 * @param {number} id The feed id
	 * @param {?string} query The query part of the router URL
	 */
	viewFeed: function(id, query) {
		var model = CapoRSS.folders.getFeed(id);

		this.updateItemList(model, query);
	},

	/**
	 * Update the item list using a folder id.
	 * @param {number} id The folder id
	 * @param {?string} query The query part of the router URL
	 */
	viewFolder: function(id, query) {
		var model = CapoRSS.folders.get(id);

		this.updateItemList(model, query);
	},

	/**
	 * Update the item list using the AllItemFolder.
	 * @param {?string} query The query part of the router URL
	 */
	viewAllItems: function(query) {
		var model = CapoRSS.folderList.allItemsFolder;
		this.updateItemList(model, query);
	},

	/**
	 * Go to the router url for the model in parameter.
	 * @param {(CapoRSS.Model.Folder|CapoRSS.Model.Feed|CapoRSS.Model.AllItemFolder)} model
	 */
	goToModel: function(model) {
		if(model instanceof Folder) {
			this.navigate('folder/' + model.id, {trigger: true});
		}
		else if(model instanceof Feed) {
			this.navigate('feed/' + model.id, {trigger: true});
		}
		else {
			this.navigate('item', {trigger: true});
		}
    }
});
