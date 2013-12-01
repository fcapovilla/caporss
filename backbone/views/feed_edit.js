CapoRSS.View.FeedEdit = Backbone.Marionette.ItemView.extend({
	template: '#tmpl-feed-edit',
	events: {
		'click #saveFeedButton' : 'saveFeed',
	},

	/**
	 * Data sent to the template.
	 * @return {Object}
	 */
	serializeData: function() {
		return {
			'feed': this.model.attributes,
			'feed_folder_title': CapoRSS.folders.get(this.model.get('folder_id')).get('title')
		};
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
	saveFeed: function() {
		var feedFolder = this.$('#feedFolder').val();
		var feedUrl = this.$('#feedUrl').val();
		var reset = this.$('#resetFeed').is(':checked');
		var pshb = this.$('#feedUsePSHB').is(':checked');
		var feedId = this.model.id;

		this.model.unset('position');
		this.model.save({
			url: feedUrl,
			folder: feedFolder,
			pshb: pshb
		},{
			success: function() {
				CapoRSS.router.navigate("", {trigger: true});

				if(reset) {
					$.ajax({
						url: '/api/feed/' + feedId,
						method: 'PUT',
						data: JSON.stringify({action: 'reset'}),
						success: function() {
							CapoRSS.folders.fetch();
						}
					});
				}
				else {
					CapoRSS.folders.fetch();
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

		this.$('#feedFolder').typeahead({
			source: CapoRSS.folders.map(function(folder) {
				return folder.get('title');
			})
		});

		var that = this;
		this.$('.modal').on('shown.bs.modal', function() {
			that.$('#feedUrl').focus();
		}).on('hidden.bs.modal', function() {
			that.remove();
		}).modal();
	}
});
