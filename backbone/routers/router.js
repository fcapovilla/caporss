var Router = Backbone.Router.extend({
	routes: {
		"": "clear",
		"feed/:id": "viewFeed",
		"folder/:id": "viewFolder",
		"item": "viewAllItems"
	},
	initialize: function() {
		this.itemList = new Backbone.Marionette.Region({
			el: '#item-list'
		});
	},
	clear: function() {
		$('#item-list').scrollTop(0);

		this.itemList.close();

		if(currentSelection !== null) {
			currentSelection.set('active', false);
			currentSelection = null;
		}

		$('.mobile-item-button').addClass('invisible');
		$('#item-list').addClass('hidden-phone');
		$('.feed-list').removeClass('hidden-phone');
	},
	updateItemList : function(model) {
		var that = this;
		$('#item-list').scrollTop(0);

		items = new ItemListView({collection: model.items});
		model.items.fetch({reset: true, reset_pagination: true, success: function() {
			that.itemList.show(items);
		}});

		if(currentSelection !== null) {
			currentSelection.set('active', false);
		}
		model.set('active', true);
		currentSelection = model;

		$('#item-list').removeClass('hidden-phone');
		$('.feed-list').addClass('hidden-phone');
		$('.mobile-item-button').removeClass('invisible');
		$('#item-list').focus();
	},
	viewFeed: function(id) {
		var model = null;
		folders.each(function(folder) {
			if(folder.feeds.get(id)) {
				model = folder.feeds.get(id);
			}
		});

		this.updateItemList(model);
	},
	viewFolder: function(id) {
		var model = folders.get(id);

		this.updateItemList(model);
	},
	viewAllItems: function() {
		var model = folderList.allItemsFolder;
		this.updateItemList(model);
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
