CapoRSS.View.Subscription = Backbone.Marionette.ItemView.extend({
	tagName: 'tr',
	template: '#tmpl-subscription',
	events: {
		'click .syncFeedAction' : 'syncFeed',
		'click .editFeedAction' : 'showFeedEditDialog',
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
		return {
			'feed': this.model.attributes,
			'pshb_expired': this.model.isPSHBExpired()
		};
    },

	/**
	 * View helpers for use in template.
	 */
	templateHelpers: {
		/**
		 * Date format view helper.
		 * @param {Date} date
		 * @return {string} The formatted date
		 */
		formatDate: function(date) {
			var pad = function(n){return n<10 ? '0'+n : n;};
			return  pad(date.getDate())+'/'+
				pad(date.getMonth()+1)+'/'+
				pad(date.getFullYear())+' '+
				pad(date.getHours())+':'+
				pad(date.getMinutes())+':'+
				pad(date.getSeconds());
		}
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
			var that = this;
			this.model.destroy({success: function() {
				CapoRSS.folders.get(that.model.get('folder_id')).fetchChildren();
			}});
		}
	},

	/**
	 * Show feed edition dialog.
	 */
	showFeedEditDialog: function() {
		$('#settingsModal').modal('hide');

		var feedEdit = new CapoRSS.View.FeedEdit({model: this.model});
		feedEdit.showModal();

		$('#editFeedModal').one('hidden.bs.modal', function() {
			$('#settingsModal').modal('show');
		});
	},

	/**
	 * Synchronize the feed.
	 */
	syncFeed: function() {
		var that = this;
		$.ajax({
			method: 'POST',
			url: '/sync/feed/' + this.model.id,
			dataType: 'json',
			success: function(result) {
				that.model.fetch({
					success: function() {
						new PNotify({ title: 'CapoRSS - ' + LANG.new_items, text: result.new_items + ' ' + LANG.new_items.toLowerCase(), type: 'success' });
					}
				});
				CapoRSS.folders.getFeed(that.model.id).fetch();
			}
		});
	},

	/**
	 * Action: Toggle Pubsubhubbub for this feed.
	 */
	togglePSHB: function() {
		var that=this;
		var value = (this.model.get('pshb')=='inactive')?'requested':'inactive';
		// Skip sync, we will wait for an event from the server
		this.model.save({'pshb': value, 'skip_sync': true}, {
			success: function() {
				that.model.set('skip_sync', false);
			}
		});
	}
});
