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
		items.addAll();
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
		}
	});
});

$('#subscribeButton').click(function() {
	$.ajax({
		url: '/subscribe',
		method: 'POST',
		data: {
			url: $('#subscriptionUrl').val(),
			folder: $('#subscriptionFolder').val()
		},
		success: function() {
			folders.fetch();
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
			feed.save({
				url: feedUrl,
				folder: feedFolder
			},{
				success: function() {
					if(items !== null) {
						items.$el.empty();
					}
					currentSelection = null;

					if(reset) {
						$.ajax({
							url: '/reset/feed/' + feedId,
							method: 'POST',
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
	$.pnotify({ text: 'Failed to call "' + settings.url + '" : ' + request.status + ' ' + request.statusText, type: 'error' });
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


// Disable keyboard events when in inputs
//
$(':input').keyup(function(e) {
	e.stopImmediatePropagation();
});
$(':input').keydown(function(e) {
	e.stopImmediatePropagation();
});

// Keyboard shortcuts
//
$(document).keyup(function(e) {
	var container = null;
	var currentItem = null;

	if(e.shiftKey) {
		var model = null;
		if(e.keyCode == 74) { // SHIFT+J
			model = folders.first();
			if(currentSelection !== null) {
				model = currentSelection.getNextInList();
			}
			router.goToModel(model);
		}
		if(e.keyCode == 75) { // SHIFT+K
			model = folders.first();
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

		if(e.keyCode == 82) { // R
			$('#syncButton').click();
		}
		if(e.keyCode == 72) { // H
			$('#toggleReadVisibilityButton').click();
		}
		if(e.keyCode == 65) { // A
			$('#subscriptionModal').modal().on('shown', function() {
				$('#subscriptionUrl').focus();
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

		if(x < 250) {
			x = 250;
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
