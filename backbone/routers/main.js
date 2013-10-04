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
	clear: function() {
		$('#item-list').scrollTop(0);

		this.itemListRegion.close();

		if(this.currentSelection !== null) {
			this.currentSelection.set('active', false);
			this.currentSelection = null;
		}

		$('.mobile-item-button').addClass('invisible');
		$('#item-list').addClass('hidden-phone');
		$('.feed-list').removeClass('hidden-phone');
	},
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

		$('#item-list').removeClass('hidden-phone');
		$('.feed-list').addClass('hidden-phone');
		$('.mobile-item-button').removeClass('invisible');
		$('#item-list').focus();
	},
	viewFeed: function(id, query) {
		var model = CapoRSS.folders.getFeed(id);

		this.updateItemList(model, query);
	},
	viewFolder: function(id, query) {
		var model = CapoRSS.folders.get(id);

		this.updateItemList(model, query);
	},
	viewAllItems: function(query) {
		var model = CapoRSS.folderList.allItemsFolder;
		this.updateItemList(model, query);
	},
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
