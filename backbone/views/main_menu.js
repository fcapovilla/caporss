CapoRSS.View.MainMenu = Backbone.Marionette.CompositeView.extend({
	el: $('#mainmenu'),
	template: '#tmpl-mainmenu',
	events: {
		'click #syncButton': 'sync',
		'click #subscriptionModalButton': 'showSubscriptionModal',
		'click #settingsModalButton': 'showSettingsModal',
		'click #mobilePrevItem' : 'prevItem',
		'click #mobileNextItem' : 'nextItem',
		'click #toggleReadVisibility' : 'toggleReadVisibility',
		'click #toggleSearchFilters' : 'toggleSearchFilters'
	},

	/**
	 * Action on menu render.
	 */
	onRender: function() {
		if($.cookie('show_read') !== undefined) {
			this.setReadVisibility($.cookie('show_read')=='true' ? true : false);
		}
		if($.cookie('search_filters') !== undefined) {
			this.setSearchFilters($.cookie('search_filters')=='true' ? true : false);
		}
	},

	/**
	 * Sync all items.
	 * @param {?Object} elem
	 * @param {?Object} options
	 */
	sync: function(elem, options) {
		var icon = this.$('#syncButton>i');
		icon.attr('class', 'fa fa-clock-o');
		$.ajax({
			url: '/sync/all',
			method: 'POST',
			dataType: 'json',
			data: options,
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
			this.$('#toggleReadVisibility>i').attr('class', 'fa fa-eye');
		}
		else {
			this.$('#toggleReadVisibility>i').attr('class', 'fa fa-eye-slash');
		}

		$.cookie('show_read', show_read, {expires: 10000});
		SETTINGS.show_read = show_read;

		CapoRSS.router.refreshItemList({show_read: show_read});
	},

	/**
	 * Toggle search filters bar.
	 */
	toggleSearchFilters: function() {
		this.setSearchFilters(!SETTINGS.search_filters);
	},

	/**
	 * Show/hide search filters.
	 * @param {boolean} search_filters
	 */
	setSearchFilters: function(search_filters) {
		$.cookie('search_filters', search_filters, {expires: 10000});
		SETTINGS.search_filters = search_filters;

		if(search_filters) {
			$('#filters').show();
		}
		else {
			$('#filters').hide();
		}

		$(window).resize();
	},

	/**
	 * Show subscription dialog.
	 */
	showSubscriptionModal: function() {
		var subscribe = new CapoRSS.View.Subscribe();
		subscribe.showModal();
	},

	/**
	 * Show settings dialog.
	 */
	showSettingsModal: function() {
		$('#settingsModal .nav a:first').tab('show');
		$('#settingsModal').modal();
	}
});
