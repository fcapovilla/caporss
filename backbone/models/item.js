var Item = Backbone.Model.extend({
	toJSON: function() {
		// Syncable attributes
		return {read: this.get('read')};
	},
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
	sendAction: function(action) {
		return $.ajax({
			method: 'PUT',
			url: '/api/item/' + this.id,
			data: JSON.stringify({action: action}),
			success: function() {
				router.currentSelection.fetch();
			}
		});
	}
});
