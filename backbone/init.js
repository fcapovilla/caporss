var items = null;
var currentSelection = null;

var router = new Router();
var folders = new FolderCollection();
var folderList = new FolderListView({collection: folders});

folders.fetch({success: function() {
	Backbone.history.start();
}});

// Configure pnotify

var pnotify_stack = {'dir1': 'up', 'dir2': 'left'};
$.pnotify.defaults.addclass = 'stack-bottomright';
$.pnotify.defaults.history = false;
$.pnotify.defaults.stack = pnotify_stack;


// Buttons and dialogs actions

$('#toggleReadVisibilityButton').click(function() {
	if(SETTINGS.show_read) {
		SETTINGS.show_read = false;
		$('#toggleReadVisibilityButton>i').attr('class', 'icon-eye-close');
	}
	else {
		SETTINGS.show_read = true;
		$('#toggleReadVisibilityButton>i').attr('class', 'icon-eye-open');
	}

	if(items !== null) {
		items.addAll();
	}
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
	items.moveCursor({keyCode: 74});
});

$('#mobileNextItem').click(function() {
	items.moveCursor({keyCode: 75});
});

// Add a spinner icon when an Ajax call is running
$(document).ajaxStart(function() {
	$('#spinner').removeClass('invisible').addClass('icon-spin');
}).ajaxStop(function() {
	$('#spinner').removeClass('icon-spin').addClass('invisible');
});

// Manage AJAX errors
$(document).ajaxError(function(event, request, settings) {
	$.pnotify({ text: 'Failed to call "' + settings.url + '" : ' + request.status + ' ' + request.statusText, type: 'error' });
});

// Prevent double-submit in the OPML upload form
$('form.upload-form').submit(function(e) {
	if($(this).data('submitted') === true) {
		e.preventDefault();
	}
	else {
		$(this).data('submitted', true);
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


// Keyboard shortcuts
$(document).keyup(function(e) {
	if(e.keyCode == 74 || e.keyCode == 75) {
		if(items !== null) {
			items.moveCursor(e);
		}
	}
});

// Refresh timeout
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
if(SETTINGS.sync_timeout > 0) {
	setInterval(function() {
		$('#syncButton').click();
	}, SETTINGS.sync_timeout*60*1000);
}

// Dragbar
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
	});
});
$(document).mouseup(function(e){
	$(document).unbind('mousemove');
});
