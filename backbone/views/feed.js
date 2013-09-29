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
	serializeData: function() {
		return {'feed': this.model.attributes};
	},
	onRender: function() {
		this.$('.favicon').on('error', this.onFaviconError);
	},

	onFaviconError: function() {
		this.model.set('favicon_id', null);
		this.render();
	},
	onDragStart: function(e) {
		e.stopPropagation();
		this.$el.css({opacity: 0.5});
		e.originalEvent.dataTransfer.setData('feed_id', this.model.id);
	},
	onDragEnter: function(e) {
		e.preventDefault();
		this.$el.addClass('drag-hovered');
	},
	onDragOver: function(e) {
		e.preventDefault();
	},
	onDragLeave: function(e) {
		var rect = e.currentTarget.getBoundingClientRect();
		var oe = e.originalEvent;

		if(oe.clientX >= rect.right || oe.clientX <= rect.left || oe.clientY >= rect.bottom || oe.clientY <= rect.top) {
			this.$el.removeClass('drag-hovered');
		}
	},
	onDrop: function(e) {
		e.stopPropagation();
		var feed_id = e.originalEvent.dataTransfer.getData('feed_id');
		var feed = folders.getFeed(feed_id);

		if(feed) {
			var new_position = this.model.get('position');
			if(this.model.get('folder_id') == feed.get('folder_id')) {
				if(new_position == feed.get('position')) {
					this.$el.removeClass('drag-hovered');
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
				router.navigate("", {trigger: true});
				var scroll = $('.feed-list').scrollTop();
				folders.fetch({reset: true, success: function() {
					$('.feed-list').scrollTop(scroll);
				}});
			}});
		}

		this.$el.removeClass('drag-hovered');
	},
	onDragEnd: function(e) {
		this.$el.css({opacity: ""});
	},

	selectFeed: function() {
		router.navigate("feed/" + this.model.id, {trigger: true});
	},
	deleteFeed: function(e) {
		e.stopPropagation();

		if(confirm(LANG.confirm_delete_feed)) {
			if(this.model == router.currentSelection) {
				router.navigate("", {trigger: true});
			}
			this.model.destroy({success: function() {
				if(router.currentSelection !== null) {
					router.currentSelection.items.fetch({reset: true});
				}
			}});
		}

		this.closeMenu();
	},
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
						$.pnotify({ text: result.new_items + ' new items.', type: 'success' });
					}
				});
				if(router.currentSelection !== null) {
					router.currentSelection.items.fetch({reset: true});
				}
			}
		});

		this.closeMenu();
	},
	markFeedRead: function(e) {
		e.stopPropagation();

		$.when(this.model.markRead()).then(function() {
			if(router.currentSelection !== null) {
				router.currentSelection.items.fetch({reset: true});
			}
		});

		this.closeMenu();
	},
	markFeedUnread: function(e) {
		e.stopPropagation();

		$.when(this.model.markUnread()).then(function() {
			if(router.currentSelection !== null) {
				router.currentSelection.items.fetch({reset: true});
			}
		});

		this.closeMenu();
	},
	showFeedEditDialog: function(e) {
		e.stopPropagation();

		var dialog = $('#editFeedModal');
		dialog.find('#feedId').val(this.model.id);
		dialog.find('#feedFolder').val(folders.get(this.model.get('folder_id')).get('title'));
		dialog.find('#feedUrl').val(this.model.get('url'));

		if(this.model.get('pshb_hub') !== '') {
			dialog.find('#feedPSHBInfos').removeClass('hide');
			dialog.find('#feedPSHBHub').text(this.model.get('pshb_hub'));
			dialog.find('#feedPSHBTopic').text(this.model.get('pshb_topic'));
			dialog.find('#feedPSHBExpiration').text(this.model.get('pshb_expiration'));
			dialog.find('#feedUsePSHB').prop('disabled', !this.model.get('pshb_hub'));
			dialog.find('#feedUsePSHB').prop('checked', this.model.get('pshb'));

		}
		else {
			dialog.find('#feedPSHBInfos').addClass('hide');
		}

		dialog.modal().on('shown', function() {
			$('#feedUrl').focus();
		}).on('hidden', function() {
			$('#feedUrl').blur();
		});

		this.closeMenu();
	},
	openMenu: function(e) {
		e.stopPropagation();

		var menu = this.$el.find('.feedMenu');
		var opened = !menu.hasClass('hide');

		// Close any opened menu
		$(document).click();

		if(opened) {
			return false;
		}

		menu.removeClass('hide');

		$(document).one('click', this.closeMenu);
	},
	closeMenu: function() {
		var menu = this.$el.find('.feedMenu');
		menu.addClass('hide');
	}
});
