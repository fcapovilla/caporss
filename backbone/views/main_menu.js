var MainMenuView = Backbone.Marionette.CompositeView.extend({
	el: $('#mainmenu'),
	template: '#tmpl-mainmenu',
	events: {
		'click #syncButton': 'sync',
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
		var icon = this.$el.children('i');
		icon.attr('class', 'icon-time');
		$.ajax({
			url: '/sync/all',
			method: 'POST',
			dataType: 'json',
			success: function(result) {
				folders.fetch({
					success: function() {
						if(result.new_items > 0) {
							$.pnotify({ text: result.new_items + ' new items.', type: 'success' });
						}
						icon.attr('class', 'icon-refresh');
					}
				});
				if(currentSelection !== null) {
					currentSelection.items.fetch({reset: true});
				}
			},
			error: function() {
				icon.attr('class', 'icon-refresh');
			}
		});
	},
	prevItem: function() {
		items.moveCursor('up');
	},
	nextItem: function() {
		items.moveCursor('down');
	},
	toggleReadVisibility: function() {
		this.setReadVisibility(!SETTINGS.show_read);
	},
	setReadVisibility: function(show_read) {
		if(show_read) {
			SETTINGS.show_read = true;
			this.$el.find('#toggleReadVisibility>i').attr('class', 'icon-eye-open');
			$.cookie('show_read', true, {expires: 10000});
		}
		else {
			SETTINGS.show_read = false;
			this.$el.find('#toggleReadVisibility>i').attr('class', 'icon-eye-close');
			$.cookie('show_read', false, {expires: 10000});
		}

		if(items !== null) {
			items.collection.fetch({reset: true, reset_pagination: true});
		}
	}
});
