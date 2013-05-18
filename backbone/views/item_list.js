var ItemListView = Backbone.View.extend({
	tagName: 'ul',
	className: 'nav nav-list',
	initialize: function() {
		this.cursor = null;
		this.views = [];

		this.listenTo(this.collection, 'add', this.addOne);
		this.listenTo(this.collection, 'remove', this.addAll);
		this.listenTo(this.collection, 'reset', this.addAll);
		this.listenTo(this.collection, 'sync', this.onSync);

		$(this.render().el).appendTo('#item-list');

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
	remove: function() {
		this.closeCursor();
		this.removeAllSubviews();
		Backbone.View.prototype.remove.call(this);

		this.$next_page.remove();
		delete this.$next_page;
	},
	removeAllSubviews: function() {
		_.each(this.views, function(view) {
			view.remove();
		});
		this.views.length = 0;
	},
	addOne: function(item) {
		var view = new ItemView({model: item});
		this.$el.append(view.render().el);
		this.views.push(view);
	},
	addAll: function() {
		// Keep scroll position
		var scroll = $('#item-list').scrollTop();

		this.$el.empty();
		this.removeAllSubviews();
		this.collection.each(this.addOne, this);

		$('#item-list').scrollTop(scroll);
	},
	onSync: function() {
		this.$next_page = this.$next_page.detach();
		this.$next_page.appendTo(this.$el);
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
