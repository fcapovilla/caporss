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
	onRender: function() {
		if($.cookie('show_read') !== undefined) {
			this.setReadVisibility($.cookie('show_read')=='true' ? true : false);
		}
	},

	sync: function() {
		var icon = this.$el.find('#syncButton>i');
		icon.attr('class', 'icon icon-time');
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
						icon.attr('class', 'icon icon-refresh');
					}
				});
				if(CapoRSS.router.currentSelection !== null) {
					CapoRSS.router.currentSelection.items.fetch({reset: true});
				}
			},
			error: function() {
				icon.attr('class', 'icon icon-refresh');
			}
		});
	},
	prevItem: function() {
		CapoRSS.router.itemList.moveCursor('up');
	},
	nextItem: function() {
		CapoRSS.router.itemList.moveCursor('down');
	},
	toggleReadVisibility: function() {
		this.setReadVisibility(!SETTINGS.show_read);
	},
	setReadVisibility: function(show_read) {
		if(show_read) {
			SETTINGS.show_read = true;
			this.$el.find('#toggleReadVisibility>i').attr('class', 'icon icon-eye-open');
			$.cookie('show_read', true, {expires: 10000});
		}
		else {
			SETTINGS.show_read = false;
			this.$el.find('#toggleReadVisibility>i').attr('class', 'icon icon-eye-close');
			$.cookie('show_read', false, {expires: 10000});
		}

		if(CapoRSS.router.currentSelection !== null) {
			CapoRSS.router.itemList.cursor = null;
			CapoRSS.router.currentSelection.items.fetch({reset: true, reset_pagination: true});
		}
	},
	showSubscriptionModal: function() {
		$('#subscriptionModal').modal().on('shown', function() {
			$('#subscriptionUrl').focus();
		}).on('hidden', function() {
			$('#subscriptionUrl').blur();
		});
	},
	showSettingsModal: function() {
		$('#settingsModal .nav a:first').tab('show');
		$('#settingsModal').modal().css({
			'width': ($(document).width() * 0.9) + 'px',
			'margin-left': function () {
				return -($(this).width() / 2);
			},
		});
	}
});
