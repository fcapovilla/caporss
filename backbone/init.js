var router = new Router();
var folders = new FolderCollection();
var folderList = new FolderListView({collection: folders});

var mainMenu = new MainMenuView();
mainMenu.render();

// Configure pnotify
var pnotify_stack = {'dir1': 'up', 'dir2': 'left'};
$.pnotify.defaults.addclass = 'stack-bottomright';
$.pnotify.defaults.history = false;
$.pnotify.defaults.stack = pnotify_stack;

// Set timeout for AJAX requests
$.ajaxSetup({timeout:30000});

// Show flash messages
if(FLASH.success) {
	$.pnotify({ text: FLASH.success, type: 'success' });
}
if(FLASH.error) {
	$.pnotify({ text: '<b>Error</b><br>' + FLASH.error, type: 'error' });
}

// Add a spinner icon when an Ajax call is running
$(document).ajaxStart(function() {
	$('#spinner').removeClass('invisible').addClass('icon-spin');
}).ajaxStop(function() {
	$('#spinner').removeClass('icon-spin').addClass('invisible');
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
	$('.feed-list').css('height', $(window).height() - 42);
	if($(window).width() <= 767) {
		$('#item-list').css('height', $(window).height() - 42);
	}
	else {
		$('#item-list').css('height', $(window).height());
	}
}).resize();

// Refresh timeout
if(SETTINGS.refresh_timeout > 0) {
	setInterval(function() {
		folders.refresh();
	}, SETTINGS.refresh_timeout*60*1000);
}

// Sync timeout
if(SETTINGS.sync_timeout > 0) {
	setInterval(function() {
		$('#syncButton').click();
	}, SETTINGS.sync_timeout*60*1000);
}

// EventSource refresh
if (!!window.EventSource) {
	var eventSource = new EventSource('/stream');
	eventSource.onmessage = function(e) {
		switch(e.data) {
			case 'sync:new_items':
				folders.refresh();
			break;
		}
	};
}

// Automatic page fetching
$('#item-list').scroll(function() {
	if(router.itemList !== null) {
		router.itemList.onItemListScroll();
	}
});

// Everything is ready, fetch folders
folders.fetch({success: function() {
	Backbone.history.start();
}});
