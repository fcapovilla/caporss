var FolderView = Backbone.View.extend({
	tagName: "li",
	template: _.template($('#tmpl-folder').html(), null, {variable:'folder'}),
	events: {
		'click .markFolderReadAction' : 'markFolderRead',
		'click .markFolderUnreadAction' : 'markFolderUnread',
		'click .syncFolderAction' : 'syncFolder',
		'click .editFolderAction' : 'showFolderEditDialog',
		'click .deleteFolderAction' : 'deleteFolder',
		'click .folder-icon' : 'toggleFolderOpen',
		'click .menu-toggle': 'openMenu',
		'click .folderTitle' : 'selectFolder'
	},
	initialize: function() {
		this.views = [];

		_.bindAll(this);
		this.listenTo(this.model, 'change', this.render);
		this.listenTo(this.model, 'destroy', this.remove);
		this.listenTo(this.model.feeds, 'add', this.addOne);
		this.listenTo(this.model.feeds, 'remove', this.addAll);
		this.listenTo(this.model.feeds, 'reset', this.addAll);

		this.$feedList = $('<ul class="nav nav-list"></ul>');
	},
	render: function() {
		this.$el.html(this.template(this.model.attributes));
		if(this.model.get('open')) {
			this.addAll();
			this.$el.append(this.$feedList);
		}
		return this;
	},
	remove: function() {
		this.removeAllSubviews();
		this.$feedList.clear();
		Backbone.View.prototype.remove.call(this);
	},
	removeAllSubviews: function() {
		_.each(this.views, function(view) {
			view.remove();
		});
		this.views.length = 0;
	},
	addOne: function(feed) {
		var view = new FeedView({model: feed});
		this.$feedList.append(view.render().el);
		this.views.push(view);
	},
	addAll: function() {
		this.removeAllSubviews();
		this.$feedList.empty();
		this.model.feeds.each(this.addOne, this);
	},
	toggleFolderOpen: function() {
		this.model.toggle();
		return false;
	},
	deleteFolder: function() {
		if(confirm(LANG.confirm_delete_folder)) {
			this.model.destroy();
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
			}
		});
		return this.closeMenu();
	},
	markFolderRead: function() {
		this.model.feeds.each(function(feed) {
			feed.markRead();
		});
		return this.closeMenu();
	},
	markFolderUnread: function() {
		this.model.feeds.each(function(feed) {
			feed.markUnread();
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
