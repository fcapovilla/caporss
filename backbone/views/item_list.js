CapoRSS.View.ItemList = Backbone.Marionette.CompositeView.extend({
	childView: CapoRSS.View.Item,
	childViewContainer: 'ul',
	template: '#tmpl-itemlist',
	collectionEvents: {
		'reset': 'onReset',
		'all_loaded': 'render',
		'sync': 'onSync'
	},
	events: {
		'click .show_more_items': function(){ this.fetchNextPage(); }
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
		var currentItem = this.collection.get(this.cursor);
		if(currentItem !== undefined) {
			currentItem.set('open', 'true');
		}
	},

	/**
	 * Action when item list is synchronized
	 */
	onSync: function() {
		this.render();

		var elem = $('#item-list').eq(0);
		if(elem[0] !== undefined && elem[0].scrollHeight <= elem.outerHeight()+200) {
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
		var currentItem = this.collection.get(this.cursor);
		if(currentItem !== undefined) {
			currentItem.set('open', false);
		}
	},

	/**
	 * Change the item that's currenly open by moving to the next or previous item.
	 * @param {string} direction 'up' or 'down'
	 */
	moveCursor: function(direction) {
		var item = null;
		var currentItem = this.collection.get(this.cursor);

		if(currentItem === undefined) {
			if(direction == 'down') {
				item = this.collection.first();
			}
		}
		else {
			var index = this.collection.indexOf(currentItem);
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
