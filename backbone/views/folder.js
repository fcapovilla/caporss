var FolderView = Backbone.Marionette.CompositeView.extend({
	tagName: "li",
	itemViewContainer: 'ul.nav.nav-list',
	template: '#tmpl-folder',
	events: {
		'click .markFolderReadAction' : 'markFolderRead',
		'click .markFolderUnreadAction' : 'markFolderUnread',
		'click .syncFolderAction' : 'syncFolder',
		'click .editFolderAction' : 'showFolderEditDialog',
		'click .deleteFolderAction' : 'deleteFolder',
		'click .folder-toggle' : 'toggleFolderOpen',
		'click .folder-icon': 'openMenu',
		'click .folderTitle' : 'selectFolder'
	},
	modelEvents: {
		'change': 'render',
		'destroy': 'remove'
	},
	initialize: function() {
		this.collection = this.model.feeds;
		this.itemView = FeedView;

		_.bindAll(this);
	},
	serializeData: function() {
		return {'folder': this.model.attributes};
    },

	toggleFolderOpen: function() {
		this.model.toggle();
		return false;
	},
	deleteFolder: function() {
		if(confirm(LANG.confirm_delete_folder)) {
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
	syncFolder: function() {
		var that = this;
		$.ajax({
			method: 'POST',
			url: '/sync/folder/' + this.model.id,
			dataType: 'json',
			success: function(result) {
				that.model.feeds.fetch({
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
	markFolderRead: function() {
		var deferreds = this.model.feeds.map(function(feed) {
			return feed.markRead();
		});

		$.when.apply($, deferreds).then(function() {
			if(currentSelection !== null) {
				currentSelection.items.fetch({reset: true});
			}
		});

		return this.closeMenu();
	},
	markFolderUnread: function() {
		var deferreds = this.model.feeds.map(function(feed) {
			return feed.markUnread();
		});

		$.when.apply($, deferreds).then(function() {
			if(currentSelection !== null) {
				currentSelection.items.fetch({reset: true});
			}
		});

		return this.closeMenu();
	},
	openMenu: function() {
		var menu = this.$el.find('.folderMenu');
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
		var menu = this.$el.find('.folderMenu');
		menu.addClass('hide');
		return false;
	},
	selectFolder: function() {
		router.navigate("folder/" + this.model.id, {trigger: true});
	},
	showFolderEditDialog: function() {
		var dialog = $('#editFolderModal');
		dialog.find('#folderId').val(this.model.id);
		dialog.find('#folderTitle').val(this.model.get('title'));
		dialog.modal();
		return this.closeMenu();
	}
});
