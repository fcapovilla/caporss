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
