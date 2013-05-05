var SpecialFolderView = Backbone.View.extend({
	tagName: "li",
	template: _.template($('#tmpl-special-folder').html(), null, {variable:'folder'}),
	events: {
		'click .folderTitle' : 'selectFolder'
	},
	initialize: function() {
		_.bindAll(this);
		this.listenTo(this.model, 'change', this.render);
		this.listenTo(this.model, 'destroy', this.remove);
	},
	render: function() {
		this.$el.html(this.template(this.model.attributes));
		return this;
	},
	selectFolder: function() {
		router.navigate(this.model.get('route'), {trigger: true});
	}
});
