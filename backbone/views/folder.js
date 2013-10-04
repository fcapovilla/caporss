CapoRSS.View.Folder = Backbone.Marionette.CompositeView.extend({
	tagName: "li",
	attributes: {
		'draggable': true
	},
	itemViewContainer: 'ul.unstyled',
	itemView: CapoRSS.View.Feed,
	template: '#tmpl-folder',
	events: {
		'click .markFolderReadAction' : 'markFolderRead',
		'click .markFolderUnreadAction' : 'markFolderUnread',
		'click .syncFolderAction' : 'syncFolder',
		'click .editFolderAction' : 'showFolderEditDialog',
		'click .deleteFolderAction' : 'deleteFolder',
		'click .folder-toggle' : 'toggleFolderOpen',
		'click .folder-icon' : 'openMenu',
		'click .folder-title' : 'selectFolder',
		'dragstart' : 'onDragStart',
		'dragenter .folder-title' : 'onDragEnter',
		'dragover .folder-title' : 'onDragOver',
		'dragleave .folder-title' : 'onDragLeave',
		'drop' : 'onDrop',
		'dragend' : 'onDragEnd'
	},
	modelEvents: {
		'change': 'render',
		'destroy': 'remove'
	},
	collectionEvents: {
		'sort': 'render'
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
		this.$el.find('>.folder-title').addClass('drag-hovered');
	},
	onDragOver: function(e) {
		e.preventDefault();
	},
	onDragLeave: function(e) {
		var rect = e.currentTarget.getBoundingClientRect();
		var oe = e.originalEvent;

		if(oe.clientX >= rect.right || oe.clientX <= rect.left || oe.clientY >= rect.bottom || oe.clientY <= rect.top) {
			this.$el.find('>.folder-title').removeClass('drag-hovered');
		}
	},
	onDrop: function(e) {
		e.stopPropagation();

		var folder_id = e.originalEvent.dataTransfer.getData('folder_id');
		var folder = null;
		var dest = this.model;

		if(folder_id) {
			folder = CapoRSS.folders.get(folder_id);
		}

		if(folder) {
			var new_position = dest.get('position');
			if(new_position == folder.get('position')) {
				this.$el.find('>.folder-title').removeClass('drag-hovered');
				return;
			}
			else if(new_position < folder.get('position')) {
				new_position += 1;
			}
			folder.save({
				position: new_position
			}, { success: function() {
				CapoRSS.router.navigate("", {trigger: true});
				CapoRSS.folders.fetch();
			}});
		}

		var feed_id = e.originalEvent.dataTransfer.getData('feed_id');
		var feed = CapoRSS.folders.getFeed(feed_id);

		if(feed) {
			var old_folder_id = feed.get('folder_id');

			feed.save({
				folder_id: dest.id,
				position: 1
			}, { success: function() {
				CapoRSS.router.navigate("", {trigger: true});
				if(old_folder_id !== dest.id) {
					CapoRSS.folders.get(old_folder_id).fetch();
				}
				dest.fetch();
			}});
		}

		this.$el.find('>.folder-title').removeClass('drag-hovered');
	},
	onDragEnd: function(e) {
		this.$el.css({opacity: ""});
	},

	selectFolder: function() {
		CapoRSS.router.navigate("folder/" + this.model.id, {trigger: true});
	},
	showFolderEditDialog: function(e) {
		e.stopPropagation();

		var dialog = $('#editFolderModal');
		dialog.find('#folderId').val(this.model.id);
		dialog.find('#folderTitle').val(this.model.get('title'));

		dialog.modal().on('shown', function() {
			$('#folderTitle').focus();
		}).on('hidden', function() {
			$('#folderTitle').blur();
		});

		this.closeMenu();
	},
	toggleFolderOpen: function(e) {
		e.stopPropagation();

		this.model.toggle();

		if(this.model.get('open')) {
			this.collection = this.model.feeds;
		}
		else {
			this.collection = null;
		}

		this.render();
	},
	deleteFolder: function(e) {
		e.stopPropagation();

		if(confirm(LANG.confirm_delete_folder)) {
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
	syncFolder: function(e) {
		e.stopPropagation();

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
				if(CapoRSS.router.currentSelection !== null) {
					CapoRSS.router.currentSelection.items.fetch({reset: true});
				}
			}
		});

		this.closeMenu();
	},
	markFolderRead: function(e) {
		e.stopPropagation();

		if(confirm(LANG.confirm_read_folder)) {
			var deferreds = this.model.feeds.map(function(feed) {
				return feed.markRead();
			});

			$.when.apply($, deferreds).then(function() {
				if(CapoRSS.router.currentSelection !== null) {
					CapoRSS.router.currentSelection.items.fetch({reset: true});
				}
			});
		}

		this.closeMenu();
	},
	markFolderUnread: function(e) {
		e.stopPropagation();

		if(confirm(LANG.confirm_unread_folder)) {
			var deferreds = this.model.feeds.map(function(feed) {
				return feed.markUnread();
			});

			$.when.apply($, deferreds).then(function() {
				if(CapoRSS.router.currentSelection !== null) {
					CapoRSS.router.currentSelection.items.fetch({reset: true});
				}
			});
		}

		this.closeMenu();
	},
	openMenu: function(e) {
		e.stopPropagation();

		var menu = this.$el.find('.folderMenu');
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
		var menu = this.$el.find('.folderMenu');
		menu.addClass('hide');
	}
});
