CapoRSS.View.Subscription = Backbone.Marionette.ItemView.extend({
	tagName: 'tr',
	template: '#tmpl-subscription',
	events: {
		'click .deleteFeedAction' : 'deleteFeed',
		'click .togglePSHBAction' : 'togglePSHB',
	},
	modelEvents: {
		'destroy': 'remove',
		'change': 'render'
	},

	/**
	 * Data sent to the template.
	 * @return {Object}
	 */
	serializeData: function() {
		return {'feed': this.model.attributes};
    },

	/**
	 * Delete the feed.
	 * @param {eventObject} e
	 */
	deleteFeed: function(e) {
		if(confirm(LANG.confirm_delete_feed)) {
			if(this.model == CapoRSS.router.currentSelection) {
				CapoRSS.router.navigate("", {trigger: true});
			}
			this.model.destroy({success: function() {
				CapoRSS.subscriptions.fetch();
				CapoRSS.folders.fetch();
			}});
		}
	},

	/**
	 * Action: Toggle Pubsubhubbub for this feed.
	 */
	togglePSHB: function() {
		var value = (this.model.get('pshb')=='inactive')?'requested':'inactive';
		this.model.save({'pshb': value});
	}
});
