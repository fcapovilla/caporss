var CapoRSS = CapoRSS || {Router: {}, View: {}, Model: {}, Collection: {}};

$(function() {
	CapoRSS.router = new CapoRSS.Router.Main();
	CapoRSS.folders = new CapoRSS.Collection.Folder();
	CapoRSS.folderList = new CapoRSS.View.FolderList({collection: CapoRSS.folders});

	CapoRSS.mainMenu = new CapoRSS.View.MainMenu();
	CapoRSS.mainMenu.render();
	CapoRSS.filters = new CapoRSS.View.Filters();
	CapoRSS.filters.render();

	// Prepare feed list for subscription settings tab
	CapoRSS.subscriptions = new CapoRSS.Collection.Feed();
	CapoRSS.subscriptionList = new CapoRSS.View.SubscriptionList({collection: CapoRSS.subscriptions});
	CapoRSS.subscriptionList.render();

	// Configure pnotify
	var pnotify_stack = {'dir1': 'up', 'dir2': 'left'};
	$.pnotify.defaults.addclass = 'stack-bottomright';
	$.pnotify.defaults.history = false;
	$.pnotify.defaults.styling = 'fontawesome';
	$.pnotify.defaults.stack = pnotify_stack;

	// Show flash messages
	if(FLASH.success) {
		$.pnotify({ text: FLASH.success, type: 'success' });
	}
	if(FLASH.error) {
		$.pnotify({ text: '<b>Error</b><br>' + FLASH.error, type: 'error' });
	}

	// Set timeout for AJAX requests
	$.ajaxSetup({timeout:30000});

	// Add a spinner icon when an Ajax call is running
	$(document).ajaxStart(function() {
		$('#spinner').removeClass('invisible').addClass('fa-spin');
	});
	$(document).ajaxStop(function() {
		$('#spinner').removeClass('fa-spin').addClass('invisible');
	});

	// Manage AJAX errors
	$(document).ajaxError(function(event, request, settings) {
		if(request.responseText) {
			$.pnotify({ text: 'Failed to call "' + settings.url + '" : ' + request.status + ' ' + request.responseText, type: 'error' });
		}
		else {
			$.pnotify({ text: 'Failed to call "' + settings.url + '" : ' + request.status + ' ' + request.statusText, type: 'error' });
		}
	});

	// Resize the lists on viewport size changes
	$(window).on('resize orientationChanged', function() {
		var itemlist = $('#item-list');
		var feedlist = $('.feed-list');

		if($(window).width() <= 767) {
			feedlist.css('height', $(window).height() - feedlist.position().top);
			itemlist.css('height', $(window).height() - itemlist.position().top);
		}
		else {
			feedlist.css('height', $(window).height() - feedlist.position().top);
			itemlist.css('height', $(window).height() - itemlist.position().top);
		}
	}).resize();

	// Refresh timeout
	if(SETTINGS.refresh_timeout > 0) {
		setInterval(function() {
			CapoRSS.folders.refresh();
		}, SETTINGS.refresh_timeout*60*1000);
	}

	// Sync timeout
	if(SETTINGS.sync_timeout > 0) {
		setInterval(function() {
			$('#syncButton').click();
		}, SETTINGS.sync_timeout*60*1000);
	}

	// EventSource refresh
	if (!!window.EventSource && SETTINGS.sse_refresh) {
		var eventSource = new EventSource('/stream');

		eventSource.addEventListener("sync:new_items", function(e) {
			CapoRSS.folders.refresh();
		});

		eventSource.addEventListener("sync:feed_updated", function(e) {
			var data = $.parseJSON(e.data);

			var folder = CapoRSS.folders.get(data.folder_id);
			if(folder) {
				var feed = folder.feeds.get(data.feed_id);
				if(feed) {
					feed.fetch();

					if(CapoRSS.router.currentSelection !== null) {
						CapoRSS.router.currentSelection.items.fetch({reset: true});
					}
				}
			}

			var subscription = CapoRSS.subscriptions.get(data.feed_id);
			if(subscription) {
				subscription.fetch();
			}
		});
	}

	// Automatic page fetching
	$('#item-list').scroll(
		_.throttle(function() {
			if(CapoRSS.router.itemList !== null) {
				CapoRSS.router.itemList.onItemListScroll();
			}
		}, 400)
	);

	// Everything is ready, fetch folders
	CapoRSS.folders.fetch({success: function() {
		Backbone.history.start({pushState: true});
	}});
});
