CapoRSS.View.Item = Backbone.Marionette.ItemView.extend({
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
		'change:open': 'onOpenChanged'
	},

	/**
	 * View helpers for use in template.
	 */
	templateHelpers: {
		/**
		 * Date format view helper.
		 * @param {Date} date
		 * @return {string} The formatted date
		 */
		formatDate: function(date) {
			var pad = function(n){return n<10 ? '0'+n : n;};
			return  pad(date.getDate())+'/'+
				pad(date.getMonth()+1)+'/'+
				pad(date.getFullYear())+' '+
				pad(date.getHours())+':'+
				pad(date.getMinutes())+':'+
				pad(date.getSeconds());
		}
	},

	/**
	 * Data sent to the template.
	 * @return {Object}
	 */
	serializeData: function() {
		return {'item': this.model.attributes};
    },

	/**
	 * Action after item render.
	 */
	onRender: function() {
		if(this.model.get('open')) {
			this.$('.item-content a').attr('target', '_blank');
		}
	},

	/**
	 * Open/Close the item view.
	 */
	toggleContent: function() {
		if(this.model.get('open')) {
			this.model.set('open', false);
			CapoRSS.router.itemList.cursor = null;
		}
		else {
			CapoRSS.router.itemList.closeCursor();
			this.model.set('open', true);
			if(!this.model.get('read')) {
				this.model.toggleRead();
			}
			CapoRSS.router.itemList.cursor = this.model;
		}
	},

	/**
	 * Toggle the item as read/not read.
	 * @return {boolean} False
	 */
	toggleRead: function() {
		this.model.toggleRead();
		return false;
	},

	/**
	 * Send an action to the model.
	 */
	_sendAction: function(action) {
		$.when(this.model.sendAction(action)).then(function() {
			if(CapoRSS.router.currentSelection !== null) {
				CapoRSS.router.currentSelection.items.fetch({reset: true});
			}
		});
	},

	/**
	 * Mark all items older than this item as read.
	 */
	readAllOlder: function() {
		this._sendAction('read_older');
	},

	/**
	 * Mark all items newer than this item as read.
	 */
	readAllNewer: function() {
		this._sendAction('read_newer');
	},

	/**
	 * Mark all items older than this item as unread.
	 */
	unreadAllOlder: function() {
		this._sendAction('unread_older');
	},

	/**
	 * Mark all items newer than this item as unread.
	 */
	unreadAllNewer: function() {
		this._sendAction('unread_newer');
	},

	/**
	 * Show the dropdown menu for this item.
	 * @return {boolean} False
	 */
	showDropdownMenu: function() {
		this.$('.dropdown-toggle').dropdown('toggle');
		return false;
	},

	/**
	 * Action when the item's "open" attribute is changed.
	 * @param {CapoRSS.Model.Item} item
	 * @param {boolean} opened
	 */
	onOpenChanged: function(item, opened) {
		if(opened) {
			var that = this;
			this.once('render', function() {
				var elem = $('#item-list').eq(0);
				elem.scrollTop(that.$el.position().top + elem.scrollTop());
			});
		}
	}
});
