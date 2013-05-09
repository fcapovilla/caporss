var Router = Backbone.Router.extend({
	routes: {
		"": "clear",
		"feed/:id": "viewFeed",
		"folder/:id": "viewFolder",
		"item": "viewAllItems"
	},
	clear: function() {
		if(items !== null) {
			items.remove();
			items = null;
		}

		if(currentSelection !== null) {
			currentSelection.set('active', false);
			currentSelection = null;
		}
		window.scrollTo(0,0);

		$('.mobile-item-button').addClass('invisible');
		$('#item-list').addClass('hidden-phone');
		$('.feed-list').removeClass('hidden-phone');
	},
	updateItemList : function(model) {
		if(items !== null) {
			items.remove();
		}

		items = new ItemListView({collection: model.items});
		model.items.fetch({reset: true, reset_pagination: true});

		if(currentSelection !== null) {
			currentSelection.set('active', false);
		}
		model.set('active', true);
		currentSelection = model;
		window.scrollTo(0,0);
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
