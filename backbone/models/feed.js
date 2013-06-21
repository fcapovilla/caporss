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
			folder_id: this.get('folder_id'),
			url: this.get('url')
		};
	},
	markRead: function() {
		var that = this;
		return $.ajax({
			method: 'PUT',
			url: '/feed/' + this.id,
			data: JSON.stringify({action: 'read'}),
			success: function() {
				that.set('unread_count', 0);
			}
		});
	},
	markUnread: function() {
		var that = this;
		return $.ajax({
			method: 'PUT',
			url: '/feed/' + this.id,
			data: JSON.stringify({action: 'unread'}),
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
