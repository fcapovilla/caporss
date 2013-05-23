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
		'click .feed-icon' : 'openMenu',
		'click .feedTitle' : 'selectFeed',
	    'dragstart' : 'onDragStart',
        'dragover' : 'onDragOver',
        'drop' : 'onDrop',
	    'dragend' : 'onDragEnd'
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

	onDragStart: function(e) {
		e.stopPropagation();
		this.$el.css({opacity: 0.5});
		e.originalEvent.dataTransfer.setData('feed_id', this.model.id);
	},
	onDragOver: function(e) {
		e.preventDefault();
	},
	onDrop: function(e) {
		e.stopPropagation();
		var feed_id = e.originalEvent.dataTransfer.getData('feed_id');
		var feed = null;

		if(feed_id) {
			folders.each(function(folder) {
				if(folder.feeds.get(feed_id)) {
					feed = folder.feeds.get(feed_id);
				}
			});
		}

		if(feed) {
			var new_position = this.model.get('position');
			if(this.model.get('folder_id') == feed.get('folder_id')) {
				if(new_position == feed.get('position')) {
					this.onDragLeave();
					return;
				}
				else if(new_position < feed.get('position')) {
					new_position += 1;
				}
			}
			else {
				new_position += 1;
			}
			feed.save({
				folder_id: this.model.get('folder_id'),
				position: new_position
			}, { success: function() {
				folders.fetch({reset: true});
			}});
		}

		this.onDragLeave();
	},
	onDragEnd: function(e) {
		this.$el.css({opacity: ""});
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
