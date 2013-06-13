var ItemView = Backbone.Marionette.ItemView.extend({
	tagName: 'li',
	template: '#tmpl-item',
	events: {
		'click .readOlderAction' : 'readAllOlder',
		'click .readNewerAction' : 'readAllNewer',
		'click .unreadOlderAction' : 'unreadAllOlder',
		'click .unreadNewerAction' : 'unreadAllNewer',
		'click .readUnreadIcon': 'toggleRead',
		'click .dropdown': 'showDropdownMenu',
		'click .item-container': 'toggleContent'
	},
	modelEvents: {
		'destroy': 'remove',
		'change': 'render',
		'change:open': 'openChanged'
	},
	onRender: function() {
		if(this.model.get('open')) {
			this.$el.find('.item-content a').attr('target', '_blank');
		}
	},
	serializeData: function() {
		return {'item': this.model.attributes};
    },

	toggleContent: function() {
		if(this.model.get('open')) {
			this.model.set('open', false);
			items.cursor = null;
		}
		else {
			items.closeCursor();
			this.model.set('open', true);
			if(!this.model.get('read')) {
				this.model.toggleRead();
			}
			items.cursor = this.model;
		}
	},
	toggleRead: function() {
		this.model.toggleRead();
		return false;
	},
	_sendAction: function(action) {
		$.when(this.model.sendAction(action)).then(function() {
			if(currentSelection !== null) {
				currentSelection.items.fetch({reset: true});
			}
		});
	},
	readAllOlder: function() {
		this._sendAction('read_older');
	},
	readAllNewer: function() {
		this._sendAction('read_newer');
	},
	unreadAllOlder: function() {
		this._sendAction('unread_older');
	},
	unreadAllNewer: function() {
		this._sendAction('unread_newer');
	},
	showDropdownMenu: function() {
		this.$el.find('.dropdown-toggle').dropdown('toggle');
		return false;
	},
	openChanged: function(item, opened) {
		if(opened) {
			var that = this;
			this.once('render', function() {
				var elem = $('#item-list').eq(0);
				elem.scrollTop(that.$el.position().top + elem.scrollTop());
			});
		}
	}
});
