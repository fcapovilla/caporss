var FeedView = Backbone.View.extend({
	tagName: 'li',
	className: 'feed',
	template: _.template($('#tmpl-feed').html(), null, {variable:'feed'}),
	events: {
		'click .markFeedReadAction' : 'markFeedRead',
		'click .markFeedUnreadAction' : 'markFeedUnread',
		'click .syncFeedAction' : 'syncFeed',
		'click .editFeedAction' : 'showFeedEditDialog',
		'click .deleteFeedAction' : 'deleteFeed',
		'click .menu-toggle': 'openMenu',
		'click .feedTitle' : 'selectFeed'
	},
	initialize: function() {
		_.bindAll(this);
		this.listenTo(this.model, 'destroy', this.remove);
		this.listenTo(this.model, 'change', this.render);
	},
	render: function() {
		this.$el.html(this.template(this.model.attributes));
		return this;
	},
	selectFeed: function() {
		if(items !== null) {
			items.remove();
		}
		items = new ItemListView({collection: this.model.items});
		this.model.items.fetch();
		if(currentSelection !== null) {
			currentSelection.set('active', false);
		}
		this.model.set('active', true);
		currentSelection = this.model;
		window.scrollTo(0,0);
		$('#item-list').removeClass('hidden-phone');
		$('.feed-list').addClass('hidden-phone');
		$('.mobile-item-button').removeClass('invisible');
	},
	deleteFeed: function() {
		this.model.destroy();
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
			}
		});
		return this.closeMenu();
	},
	markFeedRead: function() {
		this.model.markRead();
		return this.closeMenu();
	},
	markFeedUnread: function() {
		this.model.markUnread();
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
