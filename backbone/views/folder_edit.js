CapoRSS.View.FolderEdit = Backbone.Marionette.ItemView.extend({
	template: '#tmpl-folder-edit',
	events: {
		'click #saveFolderButton' : 'saveFolder',
	},

	/**
	 * Data sent to the template.
	 * @return {Object}
	 */
	serializeData: function() {
		return {'folder': this.model.attributes};
    },

	/**
	 * Action after render.
	 */
	onRender: function() {
		$('#modal').html(this.el);
	},

	/**
	 * Action when the "Save" button is clicked.
	 * @return {boolean} false
	 */
	saveFolder: function() {
		this.model.save({
			title: this.$('#folderTitle').val()
		},{
			error: function(){
				this.model.set('title', this.model.previous('title'));
			}
		});

		this.$('.modal').modal('hide');

		return false;
	},

	/**
	 * Display the modal dialog
	 */
	showModal: function() {
		this.render();

		var that = this;
		this.$('.modal').on('shown.bs.modal', function() {
			that.$('#folderTitle').focus();
		}).on('hidden.bs.modal', function() {
			that.remove();
		}).modal();
	}
});
