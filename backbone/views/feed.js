var FeedView = Backbone.Marionette.ItemView.extend({
	tagName: 'li',
	attributes: {
		'draggable': true
	},
	className: 'feed',
	template: '#tmpl-feed',
	events: {
		'click .markFeedReadAction' : 'markFeedRead',
		'click .markFeedUnreadAction' : 'markFeedUnread',
		'click .syncFeedAction' : 'syncFeed',
		'click .editFeedAction' : 'showFeedEditDialog',
		'click .deleteFeedAction' : 'deleteFeed',
		'click .feed-icon': 'openMenu',
		'click .feedTitle' : 'selectFeed'
	},
	modelEvents: {
		'destroy': 'remove',
		'change': 'render'
	},
	initialize: function() {
		_.bindAll(this);
	},
	serializeData: function() {
		return {'feed': this.model.attributes};
    },

	selectFeed: function() {
		router.navigate("feed/" + this.model.id, {trigger: true});
	},
	deleteFeed: function() {
		if(confirm(LANG.confirm_delete_feed)) {
			if(this.model == currentSelection) {
				router.navigate("", {trigger: true});
			}
			this.model.destroy({success: function() {
				if(currentSelection !== null) {
					currentSelection.items.fetch({reset: true});
				}
			}});
		}
		return this.closeMenu();
	},
	syncFeed: function() {
		var that = this;
		$.ajax({
			method: 'POST',
			url: '/sync/feed/' + this.model.id,
			dataType: 'json',
			success: function(result) {
				that.model.fetch({
					success: function() {
						$.pnotify({ text: result.new_items + ' new items.', type: 'success' });
					}
				});
				if(currentSelection !== null) {
					currentSelection.items.fetch({reset: true});
				}
			}
		});
		return this.closeMenu();
	},
	markFeedRead: function() {
		$.when(this.model.markRead()).then(function() {
			if(currentSelection !== null) {
				currentSelection.items.fetch({reset: true});
			}
		});
		return this.closeMenu();
	},
	markFeedUnread: function() {
		$.when(this.model.markUnread()).then(function() {
			if(currentSelection !== null) {
				currentSelection.items.fetch({reset: true});
			}
		});
		return this.closeMenu();
	},
	showFeedEditDialog: function() {
		var dialog = $('#editFeedModal');
		dialog.find('#feedId').val(this.model.id);
		dialog.find('#feedFolder').val(folders.get(this.model.get('folder_id')).get('title'));
		dialog.find('#feedUrl').val(this.model.get('url'));
		dialog.modal();
		return this.closeMenu();
	},
	openMenu: function() {
		var menu = this.$el.find('.feedMenu');
		var opened = !menu.hasClass('hide');

		// Close any opened menu
		$(document).click();

		if(opened) {
			return false;
		}

		menu.removeClass('hide');

		$(document).one('click', this.closeMenu);
		return false;
	},
	closeMenu: function() {
		var menu = this.$el.find('.feedMenu');
		menu.addClass('hide');
		return false;
	}
});
