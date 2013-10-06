// Dialog buttons actions

// Settings dialog cleanup button
// Initiate a feed cleanup
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
				CapoRSS.folders.fetch();
				if(CapoRSS.router.currentSelection !== null) {
					CapoRSS.router.currentSelection.items.fetch({reset: true});
				}
			}
		});
	}
});


// Settings dialogs update favicon button
// Initiate a favicon update
$('#updateFaviconsButton').click(function() {
	$.ajax({
		url: '/favicon/fetch_all',
		method: 'POST',
		success: function() {
			window.location.reload(true);
		}
	});
});


// Subscription dialog button
// Add a new subscription
$('#subscribeButton').click(function() {
	$.ajax({
		url: '/api/feed',
		method: 'POST',
		data: {
			url: $('#subscriptionUrl').val(),
			folder: $('#subscriptionFolder').val()
		},
		success: function() {
			CapoRSS.folders.fetch();
			if(CapoRSS.router.currentSelection !== null) {
				CapoRSS.router.currentSelection.items.fetch({reset: true});
			}
		}
	});

	$('#subscriptionModal').modal('hide');
	$('#subscriptionUrl').val('');
	$('#subscriptionFolder').val('');

	return false;
});


// Edit folder dialog button
// Modify a folder
$('#editFolderButton').click(function() {
	var dialog = $('#editFolderModal');
	var folderId = dialog.find('#folderId').val();
	var folderTitle = dialog.find('#folderTitle').val();
	var folder = CapoRSS.folders.get(folderId);

	if(folder) {
		folder.save({
			title: folderTitle
		},{
			error: function(){
				folder.set('title', folder.previous('title'));
			}
		});
	}

	$('#editFolderModal').modal('hide');

	return false;
});


// Edit feed dialog button
// Modify a feed
$('#editFeedButton').click(function() {
	var dialog = $('#editFeedModal');
	var feedId = dialog.find('#feedId').val();
	var feedFolder = dialog.find('#feedFolder').val();
	var feedUrl = dialog.find('#feedUrl').val();
	var reset = dialog.find('#resetFeed').is(':checked');
	var pshb = dialog.find('#feedUsePSHB').is(':checked');

	var feed = CapoRSS.folders.getFeed(feedId);
	if(feed) {
		feed.unset('position');
		feed.save({
			url: feedUrl,
			folder: feedFolder,
			pshb: pshb
		},{
			success: function() {
				CapoRSS.router.navigate("", {trigger: true});

				if(reset) {
					$.ajax({
						url: '/api/feed/' + feedId,
						method: 'PUT',
						data: JSON.stringify({action: 'reset'}),
						success: function() {
							CapoRSS.folders.fetch();
						}
					});
				}
				else {
					CapoRSS.folders.fetch();
				}
			}
		});
	}

	$('#editFeedModal').modal('hide');

	return false;
});


// Search dialog button
// Initiate an item search
$('#searchButton').click(function() {
	var query = $('#searchQuery').val();
	var search_title = $('#searchInTitle').is(':checked');
	var sort_type = $('#sortType').val();

	var current_route = 'item';
	var result = Backbone.history.fragment.match(/^[^\/]+/);
	if(result !== null) {
		current_route = result[0];

		if(current_route == 'feed' || current_route == 'folder') {
			current_route = Backbone.history.fragment.match(/^[^\/]+\/([^\/]+)/)[0];
		}
	}

	var search_part = '/search/';
	if(sort_type) {
		search_part += sort_type + '/';
	}
	if(search_title) {
		search_part += 'title/';
	}
	search_part += query;

	CapoRSS.router.navigate(current_route + search_part, {trigger: true});

	$('#searchModal').modal('hide');
	$('#searchQuery').val('');

	return false;
});


// Settings dialog subscription tab action
// Fetch all subscriptions
$('#subscriptionTab').click(function() {
	CapoRSS.subscriptions.fetch();
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
