CapoRSS.View.MainMenu = Backbone.Marionette.CompositeView.extend({
	el: $('#mainmenu'),
	template: '#tmpl-mainmenu',
	events: {
		'click #syncButton': 'sync',
		'click #subscriptionModalButton': 'showSubscriptionModal',
		'click #settingsModalButton': 'showSettingsModal',
		'click #mobilePrevItem' : 'prevItem',
		'click #mobileNextItem' : 'nextItem',
		'click #toggleReadVisibility' : 'toggleReadVisibility'
	},

	/**
	 * Action on menu render.
	 */
	onRender: function() {
		if($.cookie('show_read') !== undefined) {
			this.setReadVisibility($.cookie('show_read')=='true' ? true : false);
		}
	},

	/**
	 * Sync all items.
	 */
	sync: function() {
		var icon = this.$el.find('#syncButton>i');
		icon.attr('class', 'fa fa-clock-o');
		$.ajax({
			url: '/sync/all',
			method: 'POST',
			dataType: 'json',
			timeout: 120000,
			success: function(result) {
				CapoRSS.folders.fetch({
					success: function() {
						if(result.new_items > 0) {
							$.pnotify({ text: result.new_items + ' new items.', type: 'success' });
						}
						icon.attr('class', 'fa fa-refresh');
					}
				});
				if(CapoRSS.router.currentSelection !== null) {
					CapoRSS.router.currentSelection.items.fetch({reset: true});
				}
			},
			error: function() {
				icon.attr('class', 'fa fa-refresh');
			}
		});
	},

	/**
	 * Go to previous item in item list.
	 */
	prevItem: function() {
		CapoRSS.router.itemList.moveCursor('up');
	},

	/**
	 * Go to next item in item list.
	 */
	nextItem: function() {
		CapoRSS.router.itemList.moveCursor('down');
	},

	/**
	 * Toggle show/hide read items.
	 */
	toggleReadVisibility: function() {
		this.setReadVisibility(!SETTINGS.show_read);
	},

	/**
	 * Show/hide read items.
	 * @param {boolean} show_read
	 */
	setReadVisibility: function(show_read) {
		if(show_read) {
			SETTINGS.show_read = true;
			this.$el.find('#toggleReadVisibility>i').attr('class', 'fa fa-eye');
			$.cookie('show_read', true, {expires: 10000});
		}
		else {
			SETTINGS.show_read = false;
			this.$el.find('#toggleReadVisibility>i').attr('class', 'fa fa-eye-slash');
			$.cookie('show_read', false, {expires: 10000});
		}

		if(CapoRSS.router.currentSelection !== null) {
			CapoRSS.router.itemList.cursor = null;
			CapoRSS.router.currentSelection.items.fetch({reset: true, reset_pagination: true});
		}
	},

	/**
	 * Show subscription dialog.
	 */
	showSubscriptionModal: function() {
		$('#subscriptionModal').modal().on('shown.bs.modal', function() {
			$('#subscriptionUrl').focus();
		}).on('hidden.bs.modal', function() {
			$('#subscriptionUrl').blur();
		});
	},

	/**
	 * Show settings dialog.
	 */
	showSettingsModal: function() {
		$('#settingsModal .nav a:first').tab('show');
		$('#settingsModal').modal();
	}
});
