// Disable keyboard events but ESC when in inputs
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

// Prevent default pgDown behavious of the spacebar
$(document).keydown(function(e) {
	if(e.keyCode == 32) { // SPACE
		return false;
	}
});
