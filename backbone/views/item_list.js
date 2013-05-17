var ItemListView = Backbone.Marionette.CollectionView.extend({
	//TODO: Manage "Next page" button
	//TODO: Keep scroll position on render
	tagName: 'ul',
	className: 'nav nav-list',
	initialize: function() {
		this.cursor = null;

		// Setup the "Show more items" button
		var that = this;
		this.$next_page = $('<div class="show_more_items">').text(LANG.show_more_items).click(function() {
			that.collection.fetchNextPage();
		});
		this.listenTo(this.collection, 'sync', function() {
			if(!this.collection.all_loaded) {
				this.$el.after(this.$next_page);
			}
		});
		this.listenTo(this.collection, 'all_items_loaded', function() {
			this.$next_page.remove();
		});
	},

	closeCursor: function() {
		if(this.cursor !== null) {
			this.cursor.set('open', false);
		}
	},
	moveCursor: function(direction) {
		var item = null;

		if(this.cursor === null) {
			if(direction == 'down') {
				item = this.collection.first();
			}
		}
		else {
			var index = this.collection.indexOf(this.collection.get(this.cursor.id));
			var dir = 0;

			if(direction == 'down') {
				dir = 1;
			}
			else if(direction == 'up') {
				dir = -1;
			}

			item = this.collection.at(index+dir);
		}

		if(item !== null && item !== undefined) {
			this.closeCursor();
			item.set('open', true);
			if(!item.get('read')) {
				item.toggleRead();
			}
			this.cursor = item;
		}
	}
});
