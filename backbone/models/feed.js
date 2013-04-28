var Feed = Backbone.Model.extend({
	initialize: function() {
		this.items = new ItemCollection();
		this.items.url = '/feed/' + this.id + '/item';

		this.listenTo(this.items, 'itemRead', this.decrementReadCount);
		this.listenTo(this.items, 'itemUnread', this.incrementReadCount);
	},
	toJSON: function() {
		// Syncable attributes
		return {
			position: this.get('position'),
			folder: this.get('folder'),
			url: this.get('url')
		};
	},
	markRead: function() {
		var that = this;
		$.ajax({
			method: 'PUT',
			url: 'read/feed/' + this.id,
			success: function() {
				that.set('unread_count', 0);
				if(that.get('active')) {
					that.items.fetch();
				}
			}
		});
	},
	markUnread: function() {
		var that = this;
		$.ajax({
			method: 'PUT',
			url: 'unread/feed/' + this.id,
			success: function() {
				that.fetch();
			}
		});
	},
	incrementReadCount: function() {
		this.set('unread_count', this.get('unread_count') + 1);
	},
	decrementReadCount: function() {
		this.set('unread_count', this.get('unread_count') - 1);
	},
	fetchChildren: function(options) {
		if(this.get('active')) {
			return this.items.fetch(options);
		}
	},
	fetch: function(options) {
		options = options ? options : {};
		var callbacks = _.pick(options, 'success', 'error');
		options = _.omit(options, 'success', 'error');

		var deferred = Backbone.Collection.prototype.fetch.call(this, options);

		$.when(deferred).then(function() {
			$.when(this.fetchChildren(options)).then(callbacks.success, callbacks.error);
		}, callbacks.error);

		return deferred;
	}
});
