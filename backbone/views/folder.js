var FolderView = Backbone.Marionette.CompositeView.extend({
	tagName: "li",
	attributes: {
		'draggable': true
	},
	itemViewContainer: 'ul.nav.nav-list',
	itemView: FeedView,
	template: '#tmpl-folder',
	events: {
		'click .markFolderReadAction' : 'markFolderRead',
		'click .markFolderUnreadAction' : 'markFolderUnread',
		'click .syncFolderAction' : 'syncFolder',
		'click .editFolderAction' : 'showFolderEditDialog',
		'click .deleteFolderAction' : 'deleteFolder',
		'click .folder-toggle' : 'toggleFolderOpen',
		'click .folder-icon' : 'openMenu',
		'click .folderTitle' : 'selectFolder',
		'dragstart' : 'onDragStart',
		'dragenter .folderTitle' : 'onDragEnter',
		'dragover .folderTitle' : 'onDragOver',
		'dragleave .folderTitle' : 'onDragLeave',
		'drop' : 'onDrop',
		'dragend' : 'onDragEnd'
	},
	modelEvents: {
		'change': 'render',
		'destroy': 'remove'
	},
	initialize: function() {
		if(this.model.get('open')) {
			this.collection = this.model.feeds;
		}

		_.bindAll(this);
	},
	serializeData: function() {
		return {'folder': this.model.attributes};
    },

	onDragStart: function(e) {
		this.$el.css({opacity: 0.5});
		e.originalEvent.dataTransfer.setData('folder_id', this.model.id);
	},
	onDragEnter: function(e) {
		e.preventDefault();
		this.$el.find('>.folderTitle').addClass('drag-hovered');
	},
	onDragOver: function(e) {
		e.preventDefault();
	},
	onDragLeave: function(e) {
		var rect = e.currentTarget.getBoundingClientRect();
		var oe = e.originalEvent;

		if(oe.clientX >= rect.right || oe.clientX <= rect.left || oe.clientY >= rect.bottom || oe.clientY <= rect.top) {
			this.$el.find('>.folderTitle').removeClass('drag-hovered');
		}
	},
	onDrop: function(e) {
		e.stopPropagation();

		var folder_id = e.originalEvent.dataTransfer.getData('folder_id');
		var folder = null;

		if(folder_id) {
			folder = folders.get(folder_id);
		}

		if(folder) {
			var new_position = this.model.get('position');
			if(new_position == folder.get('position')) {
				this.$el.find('>.folderTitle').removeClass('drag-hovered');
				return;
			}
			else if(new_position < folder.get('position')) {
				new_position += 1;
			}
			folder.save({
				position: new_position
			}, { success: function() {
				router.navigate("", {trigger: true});
				var scroll = $('.feed-list').scrollTop();
				folders.fetch({reset: true, success: function() {
					$('.feed-list').scrollTop(scroll);
				}});
			}});
		}

		var feed_id = e.originalEvent.dataTransfer.getData('feed_id');
		var feed = folders.getFeed(feed_id);

		if(feed) {
			feed.save({
				folder_id: this.model.id,
				position: 1
			}, { success: function() {
				router.navigate("", {trigger: true});
				var scroll = $('.feed-list').scrollTop();
				folders.fetch({reset: true, success: function() {
					$('.feed-list').scrollTop(scroll);
				}});
			}});
		}

		this.$el.find('>.folderTitle').removeClass('drag-hovered');
	},
	onDragEnd: function(e) {
		this.$el.css({opacity: ""});
	},

	toggleFolderOpen: function() {
		this.model.toggle();

		if(this.model.get('open')) {
			this.collection = this.model.feeds;
		}
		else {
			this.collection = null;
		}

		this.render();

		return false;
	},
	deleteFolder: function() {
		if(confirm(LANG.confirm_delete_folder)) {
			if(this.model == router.currentSelection) {
				router.navigate("", {trigger: true});
			}
			this.model.destroy({success: function() {
				if(router.currentSelection !== null) {
					router.currentSelection.items.fetch({reset: true});
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
				if(router.currentSelection !== null) {
					router.currentSelection.items.fetch({reset: true});
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
			if(router.currentSelection !== null) {
				router.currentSelection.items.fetch({reset: true});
			}
		});

		return this.closeMenu();
	},
	markFolderUnread: function() {
		var deferreds = this.model.feeds.map(function(feed) {
			return feed.markUnread();
		});

		$.when.apply($, deferreds).then(function() {
			if(router.currentSelection !== null) {
				router.currentSelection.items.fetch({reset: true});
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
