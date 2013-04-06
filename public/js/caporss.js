// CapoRSS - (c) 2013 Frédérick Capovilla
// CapoRSS may be freely distributed under the revised BSD license.

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
		this.listenTo(this.model, 'change:open', this.openChanged);
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
	},
	openChanged: function(item, opened) {
		if(opened) {
			var elem = $('#item-list').eq(0);
			elem.scrollTop(this.$el.position().top + elem.scrollTop());
		}
	}
});

var ItemListView = Backbone.View.extend({
	tagName: 'ul',
	className: 'nav nav-list',
	initialize: function() {
		this.cursor = null;

		_.bindAll(this);
		this.listenTo(this.collection, 'sync', this.addAll);
		this.listenTo(this.collection, 'reset', this.addAll);

		$(document).off('keyup.itemlist');
		$(document).on('keyup.itemlist', this.moveCursor);

		$(this.render().el).appendTo('#item-list');
	},
	addOne: function(item) {
		var view = new ItemView({model: item});
		this.$el.append(view.render().el);
	},
	addAll: function() {
		this.$el.empty();
		this.collection.each(this.addOne, this);
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

			if(e.keyCode == 74) { // J (down)
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
				$.pnotify({ text: result.new_items + ' new items.', type: 'success' });
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


// Folders
var Folder = Backbone.Model.extend({
	initialize: function() {
		this.set('active', false);

		this.feeds = new FeedCollection();
		this.feeds.url = '/folder/' + this.id + '/feed';
		this.feeds.fetch();

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
			success: function(result) {
				$.pnotify({ text: result.new_items + ' new items.', type: 'success' });
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
	}
});

var FolderListView = Backbone.View.extend({
	el: $('#feed-list'),
	initialize: function() {
		this.listenTo(this.collection, 'add', this.addOne);
		this.listenTo(this.collection, 'reset', this.addAll);
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


var items = null;
var currentSelection = null;
var folders = new FolderCollection();
var folderList = new FolderListView({collection: folders});
folders.fetch();


// Configure pnotify

var pnotify_stack = {'dir1': 'up', 'dir2': 'left'};
$.pnotify.defaults.history = false;
$.pnotify.defaults.delay = 5000;
$.pnotify.defaults.addclass = 'stack-bottomright';
$.pnotify.defaults.stack = pnotify_stack;


// Buttons and dialogs actions

$('#syncButton').click(function() {
	var icon = $(this).children('i');
	icon.attr('class', 'icon-time');
	$.ajax({
		url: '/sync/all',
		method: 'POST',
		success: function(result) {
			$.pnotify({ text: result.new_items + ' new items.', type: 'success' });

			if(items !== null) {
				items.$el.empty();
			}
			currentSelection = null;
			folders.fetch();
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
			if(items !== null) {
				items.$el.empty();
			}
			currentSelection = null;
			folders.fetch();
		}
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
			if(items !== null) {
				items.$el.empty();
			}
			currentSelection = null;
			folders.fetch({reset: true});
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
	var reset = dialog.find('#resetFeed').is(':checked');

	folders.each(function(folder) {
		var feed = folder.feeds.get(feedId);
		if(feed) {
			feed.save({
				url: feedUrl,
				folder: feedFolder
			},{
				success: function() {
					if(items !== null) {
						items.$el.empty();
					}
					currentSelection = null;

					if(reset) {
						$.ajax({
							url: '/reset/feed/' + feedId,
							method: 'POST',
							success: function() {
								folders.fetch({reset: true});
							}
						});
					}
					else {
						folders.fetch({reset: true});
					}
				}
			});
		}
	});
});

$('#mobileBackButton').click(function() {
	if(items !== null) {
		items.$el.empty();
	}

	if(currentSelection !== null) {
		currentSelection.set('active', false);
		currentSelection = null;
	}

	$('.mobile-item-button').addClass('invisible');
	$('#item-list').addClass('hidden-phone');
	$('.feed-list').removeClass('hidden-phone');
});

$('#mobilePrevItem').click(function() {
	items.moveCursor({keyCode: 74});
});

$('#mobileNextItem').click(function() {
	items.moveCursor({keyCode: 75});
});

// Add a spinner icon when an Ajax call is running
$(document).ajaxStart(function() {
	$('#spinner').removeClass('invisible').addClass('icon-spin');
}).ajaxStop(function() {
	$('#spinner').removeClass('icon-spin').addClass('invisible');
});

// Manage AJAX errors
$(document).ajaxError(function(event, request, settings) {
	$.pnotify({ text: 'Failed to call "' + settings.url + '" : ' + request.status + ' ' + request.statusText, type: 'error' });
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

// Resize the lists on viewport size changes
$(window).on('resize orientationChanged', function() {
	$('.feed-list').css('height', $(window).height() - 42);
	if($(window).width() <= 767) {
		$('#item-list').css('height', $(window).height() - 42);
	}
	else {
		$('#item-list').css('height', $(window).height());
	}
}).resize();

});

// Default date output format
function formatDate(date) {
	var pad = function(n){return n<10 ? '0'+n : n;};
	return  pad(date.getDate())+'/'+
			pad(date.getMonth()+1)+'/'+
			pad(date.getFullYear())+' '+
			pad(date.getHours())+':'+
			pad(date.getMinutes())+':'+
			pad(date.getSeconds());
}
