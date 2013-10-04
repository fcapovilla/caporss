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
	serializeData: function() {
		return {'folder': this.model.attributes};
    },

	selectFolder: function() {
		CapoRSS.router.navigate(this.model.get('route'), {trigger: true});
	}
});
