$(function() {

var Note = BackBone.Model.extend({
	idAttribute: "_id"
});

var NotesCollection = Backbone.Collection.extend({
	model: Note,
	url: '/note'
});

var notes = new NotesCollection();

var NoteView = Backbone.View.extend({
	tagName: "li",
	template: _.template($('#note-template').html()),
	initialize: function() {
		this.listenTo(this.model, 'change', this.render);
	},
	render: function() {
		this.$el.html(this.template(this.model.attributes));
		return this;
	}
});

var AppView = Backbone.View.extend({
	el: $('#notes-list'),
	initialize: function() {
		notes.fetch();
	},
	render: function() {
	}
});

var app = new AppView();

});
