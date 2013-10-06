CapoRSS.Model.Item = Backbone.Model.extend({

	/**
	 * Returns some attributes as JSON.
	 * Only these attributes will be sent to the server when saving the Folder.
	 * @return {Object}
	 */
	toJSON: function() {
		// Syncable attributes
		return {read: this.get('read')};
	},

	/**
	 * Mark item as read/not read.
	 * Triggers itemRead or itemUnread events.
	 */
	toggleRead: function() {
		this.set('read', !this.get('read'));
		this.save();

		if(this.get('read')) {
			this.trigger('itemRead', this.get('feed_id'));
		}
		else {
			this.trigger('itemUnread', this.get('feed_id'));
		}
	},

	/**
	 * Sends an item action to the server.
	 * @param {string} action
	 * @return {Deferred}
	 */
	sendAction: function(action) {
		return $.ajax({
			method: 'PUT',
			url: '/api/item/' + this.id,
			data: JSON.stringify({action: action}),
			success: function() {
				CapoRSS.router.currentSelection.fetch();
			}
		});
	}
});
