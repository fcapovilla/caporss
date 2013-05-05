var AllItemsFolder = Backbone.Model.extend({
	initialize: function() {
		this.items = new ItemCollection();
		this.items.url = '/item';

		this.set({
			name: LANG.all_items_folder,
			route: 'item',
			iconclass: 'icon-asterisk'
		});
	},
	getNextInList: function() {
		return folders.first();
    },
	getPreviousInList: function() {
		return this;
    }
});
