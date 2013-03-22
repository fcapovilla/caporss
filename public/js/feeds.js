$(function() {

// Items
var Item = Backbone.Model.extend({
	idAttribute: "id",
	initialize: function() {
		this.set('open', false);
	},
	toJSON: function() {
		return {read: this.get('read')};
	}
});

var ItemCollection = Backbone.Collection.extend({
	model: Item,
	url: '/item'
});

var ItemView = Backbone.View.extend({
	tagName: "li",
	template: _.template($('#tmpl-item').html()),
	events: {
		"click .readOlderAction" : "readAllOlder",
		'click .icon-check': 'toggleRead',
		'click .title': 'toggleContent'
	},
	initialize: function() {
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
		}
		else {
			items.closeAll();
			this.model.set('open', true);
			this.model.set('read', true);
			this.model.save();
			this.model.trigger('sync');
		}
	},
	close: function() {
		this.model.set('open', false);
    },
	toggleRead: function(e) {
		this.model.set('read', !this.model.get('read'));
		this.model.save();
		this.model.trigger('sync');
		return false;
	},
	readAllOlder: function() {
		var cursorDate = new Date(this.model.get('date'));
		items.collection.each(function(item) {
			var date = new Date(item.get('date'));
			if(date < cursorDate) {
				item.set('read', true);
				item.save();
			}
		});
		this.model.trigger('sync');
    }
});

var ItemListView = Backbone.View.extend({
	el: $('#item-list'),
	initialize: function() {
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
		this.$el.empty();

		this.collection = collection;

		this.listenTo(this.collection, 'add', this.addOne);
		this.listenTo(this.collection, 'reset', this.addAll);

		this.collection.fetch();
	},
	closeAll: function() {
		this.collection.each(function(item) {
			item.set('open', false);
		});
	}
});


// Feeds
var Feed = Backbone.Model.extend({
	idAttribute: "id",
	initialize: function() {
		this.items = new ItemCollection();
		this.items.url = '/feed/' + this.id + '/item';
	}
});

var FeedCollection = Backbone.Collection.extend({
	model: Feed,
	url: '/feed'
});

var FeedView = Backbone.View.extend({
	tagName: "li",
	template: _.template($('#tmpl-feed').html()),
	events: {
		"click .syncFeedAction" : "syncFeed",
		"click .deleteFeedAction" : "deleteFeed",
		"click .feedName" : "selectFeed"
	},
	initialize: function() {
		this.listenTo(this.model, 'destroy', this.remove);
		this.listenTo(this.model, 'change', this.render);
		this.listenTo(this.model.items, 'sync', this.update);
	},
	render: function() {
		this.$el.html(this.template(this.model.attributes));
		return this;
	},
	selectFeed: function() {
		items.setCollection(this.model.items);
	},
	update: function() {
		this.model.fetch();
		this.render();
	},
	deleteFeed: function() {
		this.model.destroy();
	},
	syncFeed: function() {
		var that = this;
		$.ajax({
			method: 'GET',
			url: '/sync/feed/' + this.model.id,
			success: function() {
				that.update();
			}
		});
    }
});


// Folders
var Folder = Backbone.Model.extend({
	idAttribute: "id",
	initialize: function() {
		this.feeds = new FeedCollection();
		this.feeds.url = '/folder/' + this.id + '/feed';
	},
	toggle: function() {
		this.save({open : !this.get('open')});
	},
	toJSON: function() {
		return {open: this.get('open')};
	}
});

var FolderCollection = Backbone.Collection.extend({
	model: Folder,
	url: "/folder"
});

var FolderView = Backbone.View.extend({
	tagName: "li",
	template: _.template($('#tmpl-folder').html()),
	events: {
		"click .syncFolderAction" : "syncFolder",
		"click .deleteFolderAction" : "deleteFolder",
		'click .folder-icon' : 'toggleFolderOpen'
	},
	initialize: function() {
		this.listenTo(this.model, 'change', this.render);
		this.listenTo(this.model, 'destroy', this.remove);
		this.listenTo(this.model.feeds, 'add', this.addOne);
		this.listenTo(this.model.feeds, 'reset', this.addAll);

		this.$feedList = $('<ul class="nav nav-list"></ul>');

		this.model.feeds.fetch();
	},
	render: function() {
		this.$el.html(this.template(this.model.attributes));
		if(this.model.get('open')) {
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
	},
	deleteFolder: function() {
		this.model.destroy();
	},
	syncFolder: function() {
		var that = this;
		$.ajax({
			method: 'GET',
			url: '/sync/folder/' + this.model.id,
			success: function() {
				that.model.feeds.fetch();
			}
		});
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

$('#syncButton').click(function() {
	var icon = $(this).children('i');
	icon.attr('class', 'icon-time');
	$.ajax({
		url: '/syncAll',
		method: 'GET',
		success: function() {
			folderList.collection.fetch();
			icon.attr('class', 'icon-refresh');
		},
		error: function() {
			icon.attr('class', 'icon-refresh');
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
			folderList.collection.fetch();
		}
	});
});

});
