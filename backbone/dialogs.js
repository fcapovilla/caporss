// Dialog buttons actions

$('#cleanupButton').click(function() {
	if(confirm(LANG.confirm_cleanup)) {
		$.ajax({
			url: '/cleanup/all',
			method: 'POST',
			timeout: 120000,
			data: {
				cleanup_after: $('#cleanup_after').val()
			},
			success: function() {
				folders.fetch();
				if(router.currentSelection !== null) {
					router.currentSelection.items.fetch({reset: true});
				}
			}
		});
	}
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
			if(router.currentSelection !== null) {
				router.currentSelection.items.fetch({reset: true});
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

	var feed = folders.getFeed(feedId);
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

$('#searchButton').click(function() {
	var query = $('#searchQuery').val();
	var search_title = $('#searchInTitle').is(':checked');

	var current_route = 'item';
	var result = Backbone.history.fragment.match(/^[^\/]+/);
	if(result !== null) {
		current_route = result[0];

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
	$('#searchQuery').val('');

	return false;
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
