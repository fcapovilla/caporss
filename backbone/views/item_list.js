var ItemListView = Backbone.View.extend({
	tagName: 'ul',
	className: 'nav nav-list',
	initialize: function() {
		this.cursor = null;
		this.views = [];

		this.listenTo(this.collection, 'sync', this.addAll);
		this.listenTo(this.collection, 'reset', this.addAll);

		$(this.render().el).appendTo('#item-list');
	},
	remove: function() {
		this.removeAllSubviews();
		Backbone.View.prototype.remove.call(this);
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
		this.$el.empty();
		this.removeAllSubviews();
		this.collection.each(this.addOne, this);
	},
	closeAll: function() {
		this.collection.each(function(item) {
			item.set('open', false);
		});
	},
	moveCursor: function(e) {
		var item = null;

		if(this.cursor === null) {
			if(e.keyCode == 74) {
				item = this.collection.first();
			}
		}
		else {
			var index = this.collection.indexOf(this.collection.get(this.cursor));

			if(e.keyCode == 74) { // J (down)
				item = this.collection.at(index+1);
			}
			else if(e.keyCode == 75) { // K (Up)
				item = this.collection.at(index-1);
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
