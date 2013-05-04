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
			options.reset = true;
			return this.items.fetch(options);
		}
	},
	fetch: function(options) {
		var that = this;

		options = options ? options : {};
		var callbacks = _.pick(options, 'success', 'error');
		options = _.omit(options, 'success', 'error');

		var deferred = Backbone.Collection.prototype.fetch.call(this, options);

		$.when(deferred).then(function() {
			$.when(that.fetchChildren(options)).then(callbacks.success, callbacks.error);
		}, callbacks.error);

		return deferred;
	},
	// Get next feed/folder in the folder list
	getNextInList: function() {
		var next = this.collection.at(this.collection.indexOf(this) + 1);
		if(next === null || next === undefined) {
			var folder = folders.get(this.get('folder_id'));
			next = folder.collection.at(folder.collection.indexOf(folder) + 1);
		}

		if(next === null || next === undefined) {
			next = this;
		}

		return next;
    },
	// Get previous feed/folder in the folder list
	getPreviousInList: function() {
		var prev = this.collection.at(this.collection.indexOf(this) - 1);
		if(prev === null || prev === undefined) {
			prev = folders.get(this.get('folder_id'));
		}

		if(prev === null || prev === undefined) {
			prev = this;
		}

		return prev;
    }
});
