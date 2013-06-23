var ItemListView = Backbone.Marionette.CompositeView.extend({
	itemView: ItemView,
	itemViewContainer: 'ul',
	template: '#tmpl-itemlist',
	collectionEvents: {
		'reset': 'onReset',
		'all_loaded': 'render',
		'sync': 'onSync'
	},
	events: {
		'click .show_more_items': function(){ this.collection.fetchNextPage(); }
	},
	initialize: function() {
		this.cursor = null;
		this.fetchingItems = false;
	},

	onReset: function() {
		if(this.cursor !== null) {
			this.collection.get(this.cursor).set('open', 'true');
		}
	},
	onSync: function() {
		var elem = $('#item-list').eq(0);
		if(elem[0].scrollHeight <= elem.outerHeight()+200) {
			this.fetchNextPage();
		}
	},
	onItemListScroll: function() {
		var elem = $('#item-list').eq(0);
		if(this.fetchingItems === false && elem[0].scrollHeight - elem.scrollTop() <= elem.outerHeight()+200) {
			this.fetchNextPage();
		}
	},
	serializeData: function() {
		var data = {
			query: this.collection.query,
			all_loaded: this.collection.all_loaded
		};
		return {item_list: data};
	},

	fetchNextPage: function() {
		var that = this;
		this.fetchingItems = true;
		this.collection.fetchNextPage({
			success: function() {
				that.fetchingItems = false;
			}
		});
	},
	closeCursor: function() {
		if(this.cursor !== null) {
			this.collection.get(this.cursor).set('open', false);
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

			// Try to fetch next page if we are at the end of the collection
			if(dir == 1 && this.collection.length == index+dir+1) {
				this.collection.fetchNextPage();
			}
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
