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
