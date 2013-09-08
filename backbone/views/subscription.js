var SubscriptionView = Backbone.Marionette.ItemView.extend({
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
	serializeData: function() {
		return {'feed': this.model.attributes};
    },

	deleteFeed: function(e) {
		if(confirm(LANG.confirm_delete_feed)) {
			if(this.model == router.currentSelection) {
				router.navigate("", {trigger: true});
			}
			this.model.destroy({success: function() {
				subscriptions.fetch();
				folders.fetch();
			}});
		}
	},
	togglePSHB: function() {
		this.model.save({'pshb': !this.model.get('pshb')});
	}
});
