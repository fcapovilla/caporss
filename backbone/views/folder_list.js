var FolderListView = Backbone.View.extend({
	el: $('#feed-list'),
	initialize: function() {
		this.views = [];

		this.listenTo(this.collection, 'add', this.addOne);
		this.listenTo(this.collection, 'remove', this.addAll);
		this.listenTo(this.collection, 'reset', this.addAll);
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
	addOne: function(folder) {
		var view = new FolderView({model: folder});
		this.$el.append(view.render().el);
		this.views.push(view);
	},
	addAll: function() {
		this.$el.empty();
		this.removeAllSubviews();
		this.collection.each(this.addOne, this);
	}
});
