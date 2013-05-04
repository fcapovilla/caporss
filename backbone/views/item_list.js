var ItemListView = Backbone.View.extend({
	tagName: 'ul',
	className: 'nav nav-list',
	initialize: function() {
		var that = this;
		this.cursor = null;
		this.views = [];

		this.listenTo(this.collection, 'add', this.addOne);
		this.listenTo(this.collection, 'remove', this.addAll);
		this.listenTo(this.collection, 'reset', this.addAll);
		this.listenTo(this.collection, 'all_items_loaded', function() {
			that.$next_page.remove();
		});

		$(this.render().el).appendTo('#item-list');

		this.$next_page = $('<div class="show_more_items">').text(LANG.show_more_items).click(function() {
			that.collection.fetchNextPage();
		});
		this.$el.after(this.$next_page);
	},
	remove: function() {
		this.closeAll();
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
		if(!SETTINGS.show_read && item.get('read') && !item.get('open')) {
			return;
		}

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
	closeAll: function() {
		this.collection.each(function(item) {
			item.set('open', false);
		});
	},
	moveCursor: function(direction) {
		var item = null;

		if(this.cursor === null) {
			if(direction == 'down') {
				item = this.collection.first();
			}
		}
		else {
			var index = this.collection.indexOf(this.collection.get(this.cursor));
			var dir = 0;

			if(direction == 'down') {
				dir = 1;
			}
			else if(direction == 'up') {
				dir = -1;
			}

			item = this.collection.at(index+dir);

			// If read items are hidden, loop until we get an unread item
			if(!SETTINGS.show_read) {
				while(item !== null && item !== undefined && item.get('read')) {
					index+=dir;
					item = this.collection.at(index+dir);
				}
			}
		}

		if(item !== null && item !== undefined) {
			this.closeAll();
			item.set('open', true);
			if(!item.get('read')) {
				item.toggleRead();
			}
			this.cursor = item.id;
		}
	}
});
