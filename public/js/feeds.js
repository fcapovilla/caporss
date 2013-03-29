$(function() {

// Items
var Item = Backbone.Model.extend({
	initialize: function() {
		// Client-side attribute
		this.set('open', false);
	},
	toJSON: function() {
		// Syncable attributes
		return {read: this.get('read')};
	},
	toggleRead: function() {
		this.set('read', !this.get('read'));
		this.save();

		if(this.get('read')) {
			this.trigger('itemRead', this.get('feed_id'));
		}
		else {
			this.trigger('itemUnread', this.get('feed_id'));
		}
	}
});

var ItemCollection = Backbone.Collection.extend({
	model: Item,
	url: '/item'
});

var ItemView = Backbone.View.extend({
	tagName: 'li',
	template: _.template($('#tmpl-item').html()),
	events: {
		'click .readOlderAction' : 'readAllOlder',
		'click .readUnreadIcon': 'toggleRead',
		'click .dropdown': 'showDropdownMenu',
		'click .item-container': 'toggleContent'
	},
	initialize: function() {
		this.listenTo(this.model, 'destroy', this.remove);
		this.listenTo(this.model, 'change', this.render);
	},
	render: function() {
		this.$el.html(this.template(this.model.attributes));
		if(this.model.get('open')) {
			this.$el.find('.item-content a').attr('target', '_blank');
		}
		return this;
	},
	toggleContent: function() {
		if(this.model.get('open')) {
			this.model.set('open', false);
			items.cursor = null;
		}
		else {
			items.closeAll();
			this.model.set('open', true);
			if(!this.model.get('read')) {
				this.model.toggleRead();
			}
			items.cursor = this.model.id;
		}
	},
	toggleRead: function() {
		this.model.toggleRead();
		return false;
	},
	readAllOlder: function() {
		var cursorDate = new Date(this.model.get('date'));
		items.collection.each(function(item) {
			var date = new Date(item.get('date'));
			if(date < cursorDate && !item.get('read')) {
				item.toggleRead();
			}
		});
	},
	showDropdownMenu: function() {
		this.$el.find('.dropdown-toggle').dropdown('toggle');
		return false;
	}
});

var ItemListView = Backbone.View.extend({
	el: $('#item-list'),
	initialize: function() {
		this.cursor = null;

		_.bindAll(this);
		$(document).on('keyup', this.moveCursor);
	},
	addOne: function(item) {
		var view = new ItemView({model: item});
		this.$el.append(view.render().el);
	},
	addAll: function() {
		this.$el.empty();
		this.collection.each(this.addOne, this);
	},
	setCollection: function(collection) {
		this.stopListening(this.collection);
		this.collection = collection;
		this.cursor = null;

		this.listenTo(this.collection, 'sync', this.addAll);
		this.listenTo(this.collection, 'reset', this.addAll);
		this.collection.fetch();
	},
	closeAll: function() {
		this.collection.each(function(item) {
			item.set('open', false);
		});
	},
	moveCursor: function(e) {
		var item = null;

		if(this.cursor === null) {
			if(e.keyCode == 74) {
				item = this.collection.first();
			}
		}
		else {
			var index = this.collection.indexOf(this.collection.get(this.cursor));

			if(e.keyCode == 74) { // J (down
				item = this.collection.at(index+1);
			}
			else if(e.keyCode == 75) { // K (Up)
				item = this.collection.at(index-1);
			}
		}

		if(item !== null && item !== undefined) {
			this.closeAll();
			item.set('open', true);
			if(!item.get('read')) {
				item.toggleRead();
			}
			this.cursor = item.id;
		}
	}
});


// Feeds
var Feed = Backbone.Model.extend({
	initialize: function() {
		this.set('active', false);

		this.items = new ItemCollection();
		this.items.url = '/feed/' + this.id + '/item';

		this.listenTo(this.items, 'itemRead', this.decrementReadCount);
		this.listenTo(this.items, 'itemUnread', this.incrementReadCount);
	},
	toJSON: function() {
		// Syncable attributes
		return {
			position: this.get('position'),
			folder: this.get('folder'),
			url: this.get('url')
		};
	},
	markRead: function() {
		var that = this;
		$.ajax({
			method: 'PUT',
			url: 'read/feed/' + this.id,
			success: function() {
				that.set('unread_count', 0);
				if(that.get('active')) {
					that.items.fetch();
				}
			}
		});
	},
	markUnread: function() {
		var that = this;
		$.ajax({
			method: 'PUT',
			url: 'unread/feed/' + this.id,
			success: function() {
				that.fetch();
			}
		});
	},
	incrementReadCount: function() {
		this.set('unread_count', this.get('unread_count') + 1);
	},
	decrementReadCount: function() {
		this.set('unread_count', this.get('unread_count') - 1);
	},
	fetchChildren: function() {
		if(this.get('active')) {
			this.items.fetch();
		}
	},
	fetch: function(options) {
		var res = Backbone.Collection.prototype.fetch.call(this, options);

		this.fetchChildren();

		return res;
	}
});

var FeedCollection = Backbone.Collection.extend({
	model: Feed,
	url: '/feed',
	fetch: function(options) {
		var res = Backbone.Collection.prototype.fetch.call(this, options);

		this.each(function(feed) {
			feed.fetchChildren();
		});

		return res;
	}
});

var FeedView = Backbone.View.extend({
	tagName: 'li',
	className: 'feed',
	template: _.template($('#tmpl-feed').html()),
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
		items.setCollection(this.model.items);
		if(currentSelection !== null) {
			currentSelection.set('active', false);
		}
		this.model.set('active', true);
		currentSelection = this.model;
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
			success: function() {
				that.model.fetch();
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
		dialog.find('#feedFolder').val(folderList.collection.get(this.model.get('folder_id')).get('title'));
		dialog.find('#feedUrl').val(this.model.get('url'));
		dialog.modal();
		return this.closeMenu();
	},
	openMenu: function() {
		// Close any opened menu
		$(document).click();

		var menu = this.$el.find('.feedMenu');
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


// Folders
var Folder = Backbone.Model.extend({
	initialize: function() {
		this.set('active', false);

		this.feeds = new FeedCollection();
		this.feeds.url = '/folder/' + this.id + '/feed';
		this.listenTo(this.feeds, 'change:unread_count', this.recalculateReadCount);
		this.listenTo(this.feeds, 'destroy', this.recalculateReadCount);

		this.items = new ItemCollection();
		this.items.url = '/folder/' + this.id + '/item';
		this.listenTo(this.items, 'itemRead', this.itemRead);
		this.listenTo(this.items, 'itemUnread', this.itemUnread);
	},
	toggle: function() {
		this.save({open : !this.get('open')});
	},
	toJSON: function() {
		return {open: this.get('open')};
	},
	itemRead: function(feed_id) {
		this.feeds.get(feed_id).decrementReadCount();
	},
	itemUnread: function(feed_id) {
		this.feeds.get(feed_id).incrementReadCount();
	},
	recalculateReadCount: function() {
		var count = 0;
		this.feeds.each(function(feed) {
			count += feed.get('unread_count');
		});
		this.set('unread_count', count);
	},
	fetchChildren: function() {
		if(this.get('active')) {
			this.items.fetch();
		}

		this.feeds.fetch();
	},
	fetch: function(options) {
		var res = Backbone.Collection.prototype.fetch.call(this, options);

		this.fetchChildren();

		return res;
	}
});

var FolderCollection = Backbone.Collection.extend({
	model: Folder,
	url: '/folder',
	fetch: function(options) {
		var res = Backbone.Collection.prototype.fetch.call(this, options);

		this.each(function(folder) {
			folder.fetchChildren();
		});

		return res;
	}
});

var FolderView = Backbone.View.extend({
	tagName: "li",
	template: _.template($('#tmpl-folder').html()),
	events: {
		'click .markFolderReadAction' : 'markFolderRead',
		'click .markFolderUnreadAction' : 'markFolderUnread',
		'click .syncFolderAction' : 'syncFolder',
		'click .deleteFolderAction' : 'deleteFolder',
		'click .folder-icon' : 'toggleFolderOpen',
		'click .menu-toggle': 'openMenu',
		'click .folderTitle' : 'selectFolder'
	},
	initialize: function() {
		_.bindAll(this);
		this.listenTo(this.model, 'change', this.render);
		this.listenTo(this.model, 'destroy', this.remove);
		this.listenTo(this.model.feeds, 'add', this.addOne);
		this.listenTo(this.model.feeds, 'reset', this.addAll);
		this.listenTo(this.model.feeds, 'change', this.render);

		this.$feedList = $('<ul class="nav nav-list"></ul>');

		this.model.feeds.fetch();
	},
	render: function() {
		this.$el.html(this.template(this.model.attributes));
		if(this.model.get('open')) {
			this.addAll();
			this.$el.append(this.$feedList);
		}
		return this;
	},
	addOne: function(feed) {
		var view = new FeedView({model: feed});
		this.$feedList.append(view.render().el);
	},
	addAll: function() {
		this.$feedList.empty();
		this.model.feeds.each(this.addOne, this);
	},
	toggleFolderOpen: function() {
		this.model.toggle();
		return false;
	},
	deleteFolder: function() {
		this.model.destroy();
		return this.closeMenu();
	},
	syncFolder: function() {
		var that = this;
		$.ajax({
			method: 'POST',
			url: '/sync/folder/' + this.model.id,
			success: function() {
				that.model.feeds.fetch();
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
		// Close any opened menu
		$(document).click();

		var menu = this.$el.find('.folderMenu');
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
		items.setCollection(this.model.items);
		if(currentSelection !== null) {
			currentSelection.set('active', false);
		}
		this.model.set('active', true);
		currentSelection = this.model;
	}
});

var FolderListView = Backbone.View.extend({
	el: $('#feed-list'),
	initialize: function() {
		this.listenTo(this.collection, 'add', this.addOne);
		this.listenTo(this.collection, 'reset', this.addAll);

		this.collection.fetch();
	},
	addOne: function(folder) {
		var view = new FolderView({model: folder});
		this.$el.append(view.render().el);
	},
	addAll: function() {
		this.$el.empty();
		this.collection.each(this.addOne, this);
	}
});


var items = new ItemListView();
var folderList = new FolderListView({collection: new FolderCollection()});
var currentSelection = null;


// Buttons and dialogs actions

$('#syncButton').click(function() {
	var icon = $(this).children('i');
	icon.attr('class', 'icon-time');
	$.ajax({
		url: '/sync/all',
		method: 'POST',
		success: function() {
			folderList.collection.fetch();
			icon.attr('class', 'icon-refresh');
		},
		error: function() {
			icon.attr('class', 'icon-refresh');
		}
	});
});

$('#cleanupButton').click(function() {
	$.ajax({
		url: '/cleanup/all',
		method: 'POST',
		data: {
			cleanup_after: $('#cleanup_after').val()
		},
		success: function() {
			folderList.collection.fetch();
		},
	});
});

$('#subscribeButton').click(function() {
	$.ajax({
		url: '/subscribe',
		method: 'POST',
		data: {
			url: $('#subscriptionUrl').val(),
			folder: $('#subscriptionFolder').val()
		},
		success: function() {
			folderList.collection.fetch();
		}
	});
	$('#subscriptionUrl').val('');
	$('#subscriptionFolder').val('');
});

$('#editFeedButton').click(function() {
	var dialog = $('#editFeedModal');
	var feedId = dialog.find('#feedId').val();
	var feedFolder = dialog.find('#feedFolder').val();
	var feedUrl = dialog.find('#feedUrl').val();

	folderList.collection.each(function(folder) {
		var feed = folder.feeds.get(feedId);
		if(feed) {
			feed.save({
				url: feedUrl,
				folder: feedFolder
			},{
				success: function() {
					folderList.collection.fetch();
				}
			});
		}
	});
});

// Add a spinner icon when an Ajax call is running
$(document).ajaxStart(function() {
	$('#spinner').removeClass('invisible').addClass('icon-spin');
}).ajaxStop(function() {
	$('#spinner').removeClass('icon-spin').addClass('invisible');
});

// Prevent double-submit in the OPML upload form
$('form.upload-form').submit(function(e) {
	if($(this).data('submitted') === true) {
		e.preventDefault();
	}
	else {
		$(this).data('submitted', true);
	}
});

});
