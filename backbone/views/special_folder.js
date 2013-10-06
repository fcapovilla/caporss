CapoRSS.View.SpecialFolder = Backbone.Marionette.ItemView.extend({
	tagName: "li",
	template: '#tmpl-special-folder',
	events: {
		'click .folder-title' : 'selectFolder'
	},
	modelEvents: {
		'change': 'render',
		'destroy': 'remove'
	},

	/**
	 * Data sent to the template.
	 * @return {Object}
	 */
	serializeData: function() {
		return {'folder': this.model.attributes};
    },

	/**
	 * Action when the folder is selected.
	 */
	selectFolder: function() {
		CapoRSS.router.navigate(this.model.get('route'), {trigger: true});
	}
});
