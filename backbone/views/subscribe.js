CapoRSS.View.Subscribe = Backbone.Marionette.CompositeView.extend({
	template: '#tmpl-subscribe',
	events: {
		'click #subscribeButton' : 'subscribe',
	},

	/**
	 * Action after render.
	 */
	onRender: function() {
		$('#modal').html(this.el);
	},

	/**
	 * Action when the "Subscribe" button is clicked.
	 * @return {boolean} false
	 */
	subscribe: function() {
		$.ajax({
			url: '/api/feed',
			method: 'POST',
			data: {
				url: this.$('#subscriptionUrl').val(),
				folder: this.$('#subscriptionFolder').val()
			},
			success: function() {
				CapoRSS.folders.fetch();
				if(CapoRSS.router.currentSelection !== null) {
					CapoRSS.router.currentSelection.items.fetch({reset: true});
				}
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

		this.$('#subscriptionFolder').typeahead({
			source: CapoRSS.folders.map(function(folder) {
				return folder.get('title');
			})
		});

		var that = this;
		this.$('.modal').modal().on('shown.bs.modal', function() {
			that.$('#subscriptionUrl').focus();
		}).on('hidden.bs.modal', function() {
			that.remove();
		});
	}
});
