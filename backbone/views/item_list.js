var ItemListView = Backbone.Marionette.CollectionView.extend({
	tagName: 'ul',
	className: 'nav nav-list',
	collectionEvents: {
		'sync': 'onSync'
	},
	initialize: function() {
		this.cursor = null;

		// Setup the "Show more items" button
		var that = this;
		this.$next_page = $('<div class="show_more_items">').text(LANG.show_more_items).click(function() {
			that.collection.fetchNextPage();
		});
		this.listenTo(this.collection, 'all_items_loaded', function() {
			this.$next_page.remove();
		});
	},
	onSync: function() {
		this.$next_page = this.$next_page.detach();
		this.$next_page.appendTo(this.$el);
	},
	//TODO: Keep scroll position on render

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
