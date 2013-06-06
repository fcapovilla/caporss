var items = null;
var currentSelection = null;

var router = new Router();
var folders = new FolderCollection();
var folderList = new FolderListView({collection: folders});

// Configure pnotify
//
var pnotify_stack = {'dir1': 'up', 'dir2': 'left'};
$.pnotify.defaults.addclass = 'stack-bottomright';
$.pnotify.defaults.history = false;
$.pnotify.defaults.stack = pnotify_stack;

// Show flash messages
if(FLASH.success) {
	$.pnotify({ text: FLASH.success, type: 'success' });
}
if(FLASH.error) {
	$.pnotify({ text: '<b>Error</b><br>' + FLASH.error, type: 'error' });
}

// Show/Hide read items
//
var setReadVisibility = function(show_read) {
	if(show_read) {
		SETTINGS.show_read = true;
		$('#toggleReadVisibilityButton>i').attr('class', 'icon-eye-open');
		$.cookie('show_read', true, {expires: 10000});
	}
	else {
		SETTINGS.show_read = false;
		$('#toggleReadVisibilityButton>i').attr('class', 'icon-eye-close');
		$.cookie('show_read', false, {expires: 10000});
	}

	if(items !== null) {
		items.collection.fetch({reset: true, reset_pagination: true});
	}
};

if($.cookie('show_read') !== undefined) {
	setReadVisibility($.cookie('show_read')=='true' ? true : false);
}

// Buttons and dialogs actions
//
$('#toggleReadVisibilityButton').click(function() {
	setReadVisibility(!SETTINGS.show_read);
});

$('#syncButton').click(function() {
	var icon = $(this).children('i');
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
});

$('#cleanupButton').click(function() {
	$.ajax({
		url: '/cleanup/all',
		method: 'POST',
		data: {
			cleanup_after: $('#cleanup_after').val()
		},
		success: function() {
			folders.fetch();
			if(currentSelection !== null) {
				currentSelection.items.fetch({reset: true});
			}
		}
	});
});

$('#updateFaviconsButton').click(function() {
	$.ajax({
		url: '/favicon/fetch_all',
		method: 'POST',
		success: function() {
			window.location.reload(true);
		}
	});
});

$('#subscribeButton').click(function() {
	$.ajax({
		url: '/feed',
		method: 'POST',
		data: {
			url: $('#subscriptionUrl').val(),
			folder: $('#subscriptionFolder').val()
		},
		success: function() {
			folders.fetch();
			if(currentSelection !== null) {
				currentSelection.items.fetch({reset: true});
			}
		}
	});
	$('#subscriptionUrl').val('');
	$('#subscriptionFolder').val('');
});

$('#editFolderButton').click(function() {
	var dialog = $('#editFolderModal');
	var folderId = dialog.find('#folderId').val();
	var folderTitle = dialog.find('#folderTitle').val();
	var folder = folders.get(folderId);

	if(folder) {
		folder.save({
			title: folderTitle
		},{
			error: function(){
				folder.set('title', folder.previous('title'));
			}
		});
	}
});

$('#editFeedButton').click(function() {
	var dialog = $('#editFeedModal');
	var feedId = dialog.find('#feedId').val();
	var feedFolder = dialog.find('#feedFolder').val();
	var feedUrl = dialog.find('#feedUrl').val();
	var reset = dialog.find('#resetFeed').is(':checked');

	folders.each(function(folder) {
		var feed = folder.feeds.get(feedId);
		if(feed) {
			feed.unset('position');
			feed.save({
				url: feedUrl,
				folder: feedFolder
			},{
				success: function() {
					router.navigate("", {trigger: true});

					if(reset) {
						$.ajax({
							url: '/feed/' + feedId,
							method: 'PUT',
							data: JSON.stringify({action: 'reset'}),
							success: function() {
								folders.fetch();
							}
						});
					}
					else {
						folders.fetch();
					}
				}
			});
		}
	});
});

$('#searchButton').click(function() {
	var query = $('#searchQuery').val();
	var search_title = $('#searchInTitle').is(':checked');

	var current_route = 'item';
	var result = Backbone.history.fragment.match(/^[^\/]+/);
	if(result !== null) {
		current_route = result[0]

		if(current_route == 'feed' || current_route == 'folder') {
			current_route = Backbone.history.fragment.match(/^[^\/]+\/([^\/]+)/)[0];
		}
	}

	var search_part = '/search/';
	if(search_title) {
		search_part += 'title/';
	}
	search_part += query;

	router.navigate(current_route + search_part, {trigger: true});

	$('#searchModal').modal('hide');

	return false;
});

$('#mobileBackButton').click(function() {
	router.navigate("", {trigger: true});
});

$('#mobilePrevItem').click(function() {
	items.moveCursor('up');
});

$('#mobileNextItem').click(function() {
	items.moveCursor('down');
});

// Add a spinner icon when an Ajax call is running
//
$(document).ajaxStart(function() {
	$('#spinner').removeClass('invisible').addClass('icon-spin');
}).ajaxStop(function() {
	$('#spinner').removeClass('icon-spin').addClass('invisible');
});

// Manage AJAX errors
//
$(document).ajaxError(function(event, request, settings) {
	if(request.responseText) {
		$.pnotify({ text: 'Failed to call "' + settings.url + '" : ' + request.status + ' ' + request.responseText, type: 'error' });
	}
	else {
		$.pnotify({ text: 'Failed to call "' + settings.url + '" : ' + request.status + ' ' + request.statusText, type: 'error' });
	}
});

// Prevent double-submit in the OPML upload form
//
$('form.upload-form').submit(function(e) {
	if($(this).data('submitted') === true) {
		e.preventDefault();
	}
	else {
		$(this).data('submitted', true);
	}
});

// Resize the lists on viewport size changes
//
$(window).on('resize orientationChanged', function() {
	$('.feed-list').css('height', $(window).height() - 42);
	if($(window).width() <= 767) {
		$('#item-list').css('height', $(window).height() - 42);
	}
	else {
		$('#item-list').css('height', $(window).height());
	}
}).resize();


// Disable keyboard events but ESC when in inputs
//
$(':input').keyup(function(e) {
	if(e.keyCode != 27) { // ESC
		e.stopImmediatePropagation();
	}
});
$(':input').keydown(function(e) {
	if(e.keyCode != 27) { // ESC
		e.stopImmediatePropagation();
	}
});

// Keyboard shortcuts
//
$(document).keyup(function(e) {
	var container = null;
	var currentItem = null;

	if(e.shiftKey) {
		var model = null;
		if(e.keyCode == 74) { // SHIFT+J
			model = folderList.allItemsFolder;
			if(currentSelection !== null) {
				model = currentSelection.getNextInList();
			}
			router.goToModel(model);
		}
		if(e.keyCode == 75) { // SHIFT+K
			model = folderList.allItemsFolder;
			if(currentSelection !== null) {
				model = currentSelection.getPreviousInList();
			}
			router.goToModel(model);
		}

		if(items !== null) {
			if(e.keyCode == 32) { // SHIFT+SPACE
				if(items.cursor === null || items.cursor === undefined) {
					items.moveCursor('down');
				}
				else {
					container = $('#item-list').eq(0);
					currentItem = $('.item-container.active').eq(0).closest('li');

					if(currentItem.position().top >= 0) {
						items.moveCursor('up');
					}
					else {
						container.scrollTop(container.scrollTop() - $(window).height());
						if(currentItem.position().top > 0) {
							container.scrollTop(currentItem.position().top + container.scrollTop());
						}
					}
				}

				return false;
			}
		}
	}
	else {
		if(items !== null) {
			if(e.keyCode == 74) { // J
				items.moveCursor('down');
			}
			if(e.keyCode == 75) { // K
				items.moveCursor('up');
			}

			if(e.keyCode == 32) { // SPACE
				if(items.cursor === null || items.cursor === undefined) {
					items.moveCursor('down');
				}
				else {
					container = $('#item-list').eq(0);
					currentItem = $('.item-container.active').eq(0).closest('li');
					var limit = container.scrollTop() + currentItem.position().top + currentItem.height();

					if(container.scrollTop() + $(window).height() > limit) {
						items.moveCursor('down');
					}
					else {
						container.scrollTop($(window).height() + container.scrollTop());
					}
				}

				return false;
			}
		}

		if(e.keyCode == 111 || e.keyCode == 191) { // /
			$('#searchModal').modal().on('shown', function() {
				$('#searchQuery').focus();
			}).on('hidden', function() {
				$('#searchQuery').blur();
			});
		}
		if(e.keyCode == 82) { // R
			$('#syncButton').click();
		}
		if(e.keyCode == 72) { // H
			$('#toggleReadVisibilityButton').click();
		}
		if(e.keyCode == 65) { // A
			$('#subscriptionModal').modal().on('shown', function() {
				$('#subscriptionUrl').focus();
			}).on('hidden', function() {
				$('#subscriptionUrl').blur();
			});
		}
	}
});

$(document).keydown(function(e) {
	if(e.keyCode == 32) { // SPACE
		return false;
	}
});

// Refresh timeout
//
if(SETTINGS.refresh_timeout > 0) {
	setInterval(function() {
		old_unread_count = folders.getUnreadCount();
		folders.fetch({
			success: function() {
				new_items = folders.getUnreadCount() - old_unread_count;
				if(new_items > 0) {
					$.pnotify({ text: new_items + ' new items.', type: 'success' });
				}
			}
		});
		if(currentSelection !== null) {
			currentSelection.items.fetch({reset: true});
		}
	}, SETTINGS.refresh_timeout*60*1000);
}

// Sync timeout
//
if(SETTINGS.sync_timeout > 0) {
	setInterval(function() {
		$('#syncButton').click();
	}, SETTINGS.sync_timeout*60*1000);
}

// Dragbar
//
if($.cookie('dragbar_x')) {
	var x = parseInt($.cookie('dragbar_x'),10);

	$('.side-bar').css("width",x+2);
	$('.content').css("margin-left",x+2);
	$('.feed-list').css("width",x-3);
}

$('.dragbar').mousedown(function(e){
	e.preventDefault();
	$(document).mousemove(function(e){
		var x = e.pageX;
		var maxwidth = $(window).width()-300;

		if(x < 265) {
			x = 265;
		}
		if(x > maxwidth) {
			x = maxwidth;
		}

		$('.side-bar').css("width",x+2);
		$('.content').css("margin-left",x+2);
		$('.feed-list').css("width",x-3);

		$.cookie('dragbar_x', x, {expires: 10000});
	});
});

$(document).mouseup(function(e){
	$(document).unbind('mousemove');
});

// Automatic page fetching
$('#item-list').scroll(function() {
	if(items !== null) {
		var elem = $('#item-list');
		if(elem[0].scrollHeight - elem.scrollTop() == elem.outerHeight()) {
			items.collection.fetchNextPage();
		}
	}
});

// Everything is ready, fetch folders
//
folders.fetch({success: function() {
	Backbone.history.start();
}});
