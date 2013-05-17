var ItemView = Backbone.Marionette.ItemView.extend({
	tagName: 'li',
	template: '#tmpl-item',
	events: {
		'click .readOlderAction' : 'readAllOlder',
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
