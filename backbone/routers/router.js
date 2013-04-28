var Router = Backbone.Router.extend({
	routes: {
		"feed/:id": "viewFeed",
		"folder/:id": "viewFolder"
	},
	updateItemList : function(model) {
		if(items !== null) {
			items.remove();
		}

		items = new ItemListView({collection: model.items});
		model.items.fetch();
		if(currentSelection !== null) {
			currentSelection.set('active', false);
		}
		model.set('active', true);
		currentSelection = model;
		window.scrollTo(0,0);
		$('#item-list').removeClass('hidden-phone');
		$('.feed-list').addClass('hidden-phone');
		$('.mobile-item-button').removeClass('invisible');
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
	}
});
