CapoRSS.View.Feed = Backbone.Marionette.ItemView.extend({
	tagName: 'li',
	className: 'feed',
	template: '#tmpl-feed',
	attributes: {
		'draggable': true
	},
	events: {
		'click .markFeedReadAction' : 'markFeedRead',
		'click .markFeedUnreadAction' : 'markFeedUnread',
		'click .syncFeedAction' : 'syncFeed',
		'click .editFeedAction' : 'showFeedEditDialog',
		'click .deleteFeedAction' : 'deleteFeed',
		'click .feed-icon' : 'openMenu',
		'click .feed-title' : 'selectFeed',
		'dragstart' : 'onDragStart',
		'dragenter' : 'onDragEnter',
		'dragover' : 'onDragOver',
		'dragleave' : 'onDragLeave',
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

	/**
	 * Data sent to the template.
	 * @return {Object}
	 */
	serializeData: function() {
		return {'feed': this.model.attributes};
	},

	/**
	 * Action after feed render.
	 */
	onRender: function() {
		this.$('.favicon').on('error', this.onFaviconError);
	},

	/**
	 * Action on favicon error.
	 * Remove the favicon in the model so a placeholder is used instead
	 * of the invalid favicon.
	 */
	onFaviconError: function() {
		this.model.set('favicon_id', null);
	},

	/**
	 * Action on drag-and-drop enter.
	 * @param {eventObject} e
	 */
	onDragEnter: function(e) {
		e.preventDefault();
		this.$el.addClass('drag-hovered');
	},

	/**
	 * Action on drag-and-drop hover.
	 * @param {eventObject} e
	 */
	onDragOver: function(e) {
		e.preventDefault();
	},

	/**
	 * Action on drag-and-drop leave.
	 * @param {eventObject} e
	 */
	onDragLeave: function(e) {
		var rect = e.currentTarget.getBoundingClientRect();
		var oe = e.originalEvent;

		if(oe.clientX >= rect.right || oe.clientX <= rect.left || oe.clientY >= rect.bottom || oe.clientY <= rect.top) {
			this.$el.removeClass('drag-hovered');
		}
	},

	/**
	 * Action on drag-and-drop drop.
	 * If the dropped element is a feed, move it after this feed.
	 * @param {eventObject} e
	 */
	onDrop: function(e) {
		e.stopPropagation();
		var feed_id = e.originalEvent.dataTransfer.getData('feed_id');
		var feed = CapoRSS.folders.getFeed(feed_id);
		var dest = this.model;

		if(feed) {
			var new_position = dest.get('position');
			var old_folder = null;

			if(dest.get('folder_id') == feed.get('folder_id')) {
				if(new_position == feed.get('position')) {
					// The feed was not moved, do nothing.
					this.$el.removeClass('drag-hovered');
					return;
				}
			}
			else {
				old_folder = CapoRSS.folders.get(feed.get('folder_id'));
			}

			feed.save({
				folder_id: dest.get('folder_id'),
				position: new_position
			}, { success: function() {
				CapoRSS.router.navigate("", {trigger: true});
				if(old_folder !== null) {
					old_folder.fetch();
				}
				CapoRSS.folders.get(dest.get('folder_id')).fetch();
			}});
		}

		this.$el.removeClass('drag-hovered');
	},

	/**
	 * Action on drag-and-drop start.
	 * @param {eventObject} e
	 */
	onDragStart: function(e) {
		e.stopPropagation();
		this.$el.css({opacity: 0.5});
		e.originalEvent.dataTransfer.setData('feed_id', this.model.id);
	},

	/**
	 * Action on drag-and-drop end.
	 * @param {eventObject} e
	 */
	onDragEnd: function(e) {
		this.$el.css({opacity: ""});
	},

	/**
	 * Action when the feed is selected.
	 */
	selectFeed: function() {
		CapoRSS.router.navigate("feed/" + this.model.id, {trigger: true});
	},

	/**
	 * Delete the feed.
	 * @param {eventObject} e
	 */
	deleteFeed: function(e) {
		e.stopPropagation();

		if(confirm(LANG.confirm_delete_feed)) {
			if(this.model == CapoRSS.router.currentSelection) {
				CapoRSS.router.navigate("", {trigger: true});
			}
			this.model.destroy({success: function() {
				if(CapoRSS.router.currentSelection !== null) {
					CapoRSS.router.currentSelection.items.fetch({reset: true});
				}
			}});
		}

		this.closeMenu();
	},

	/**
	 * Synchronize the feed.
	 * @param {eventObject} e
	 */
	syncFeed: function(e) {
		e.stopPropagation();

		var that = this;
		$.ajax({
			method: 'POST',
			url: '/sync/feed/' + this.model.id,
			dataType: 'json',
			success: function(result) {
				that.model.fetch({
					success: function() {
						new PNotify({ text: result.new_items + ' new items.', type: 'success' });
					}
				});
				if(CapoRSS.router.currentSelection !== null) {
					CapoRSS.router.currentSelection.items.fetch({reset: true});
				}
			}
		});

		this.closeMenu();
	},

	/**
	 * Mark the feed as read.
	 * @param {eventObject} e
	 */
	markFeedRead: function(e) {
		e.stopPropagation();

		$.when(this.model.markRead()).then(function() {
			if(CapoRSS.router.currentSelection !== null) {
				CapoRSS.router.currentSelection.items.fetch({reset: true});
			}
		});

		this.closeMenu();
	},

	/**
	 * Mark the feed as unread.
	 * @param {eventObject} e
	 */
	markFeedUnread: function(e) {
		e.stopPropagation();

		$.when(this.model.markUnread()).then(function() {
			if(CapoRSS.router.currentSelection !== null) {
				CapoRSS.router.currentSelection.items.fetch({reset: true});
			}
		});

		this.closeMenu();
	},

	/**
	 * Show feed edition dialog.
	 * @param {eventObject} e
	 */
	showFeedEditDialog: function(e) {
		e.stopPropagation();

		var feedEdit = new CapoRSS.View.FeedEdit({model: this.model});
		feedEdit.showModal();

		this.closeMenu();
	},

	/**
	 * Open the feed's menu.
	 * @param {eventObject} e
	 * @return {boolean} False if the menu is already open
	 */
	openMenu: function(e) {
		e.stopPropagation();

		var menu = this.$('.feedMenu');
		var opened = !menu.hasClass('hide');

		// Close any opened menu
		$(document).click();

		if(opened) {
			return false;
		}

		menu.removeClass('hide');

		$(document).one('click', this.closeMenu);
	},

	/**
	 * Close the feed's menu.
	 */
	closeMenu: function() {
		var menu = this.$('.feedMenu');
		menu.addClass('hide');
	}
});
