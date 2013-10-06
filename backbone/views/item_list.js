CapoRSS.View.ItemList = Backbone.Marionette.CompositeView.extend({
	itemView: CapoRSS.View.Item,
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

	/**
	 * Data sent to the template.
	 * @return {Object}
	 */
	serializeData: function() {
		var data = {
			query: this.collection.query,
			sort: this.collection.sort,
			all_loaded: this.collection.all_loaded
		};
		return {item_list: data};
	},


	/**
	 * Temporary fix for the "ItemViewContainer was not found" error.
	 */
	_initialEvents: function(){
		this.once('render', function () {
			if (this.collection){
				this.listenTo(this.collection, "add", this.addChildView, this);
				this.listenTo(this.collection, "remove", this.removeItemView, this);
				this.listenTo(this.collection, "reset", this._renderChildren, this);
			}
		}, this);
	},

	/**
	 * Action when item list is reset.
	 */
	onReset: function() {
		if(this.cursor !== null) {
			this.collection.get(this.cursor).set('open', 'true');
		}
	},

	/**
	 * Action when item list is synchronized
	 */
	onSync: function() {
		var elem = $('#item-list').eq(0);
		if(elem[0].scrollHeight <= elem.outerHeight()+200) {
			this.fetchNextPage();
		}
	},

	/**
	 * Action when item list is scrolled.
	 * Fetch next page if we are near the bottom of the screen.
	 */
	onItemListScroll: function() {
		var elem = $('#item-list').eq(0);
		if(this.fetchingItems === false && elem[0].scrollHeight - elem.scrollTop() <= elem.outerHeight()+200) {
			this.fetchNextPage();
		}
	},

	/**
	 * Fetch next item list page.
	 */
	fetchNextPage: function() {
		var that = this;
		this.fetchingItems = true;
		this.collection.fetchNextPage({
			success: function() {
				that.fetchingItems = false;
			}
		});
	},

	/**
	 * Close the item that's currently open.
	 */
	closeCursor: function() {
		if(this.cursor !== null) {
			this.collection.get(this.cursor).set('open', false);
		}
	},

	/**
	 * Change the item that's currenly open by moving to the next or previous item.
	 * @param {string} direction 'up' or 'down'
	 */
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
