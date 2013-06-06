var ItemListView = Backbone.Marionette.CompositeView.extend({
	itemView: ItemView,
	itemViewContainer: 'ul',
	template: '#tmpl-itemlist',
	collectionEvents: {
		'reset': 'onReset',
		'all_loaded': 'render'
	},
	events: {
		'click .show_more_items': function(){ this.collection.fetchNextPage(); }
	},
	initialize: function() {
		this.cursor = null;
	},

	onReset: function() {
		if(this.cursor !== null) {
			this.collection.get(this.cursor).set('open', 'true');
		}
	},
	serializeData: function() {
		var data = {
			query: this.collection.query,
			all_loaded: this.collection.all_loaded
		};
		return {item_list: data};
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
