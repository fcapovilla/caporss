// Disable keyboard events but ESC when in inputs
$(document).on('keyup keydown', ':input', function(e) {
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
			// Move to next feed/folder
			model = CapoRSS.folderList.allItemsFolder;
			if(CapoRSS.router.currentSelection !== null) {
				model = CapoRSS.router.currentSelection.getNextInList();
			}
			CapoRSS.router.goToModel(model);
		}
		if(e.keyCode == 75) { // SHIFT+K
			// Go to previous feed/folder
			model = CapoRSS.folderList.allItemsFolder;
			if(CapoRSS.router.currentSelection !== null) {
				model = CapoRSS.router.currentSelection.getPreviousInList();
			}
			CapoRSS.router.goToModel(model);
		}

		if(CapoRSS.router.itemList !== null) {
			if(e.keyCode == 32) { // SHIFT+SPACE
				// Page up in the item list. Change selected item if necessary.
				if(CapoRSS.router.itemList.cursor === null || CapoRSS.router.itemList.cursor === undefined) {
					CapoRSS.router.itemList.moveCursor('down');
				}
				else {
					container = $('#item-list').eq(0);
					currentItem = $('.item-container.active').eq(0).closest('li');

					if(currentItem.position().top >= 0) {
						CapoRSS.router.itemList.moveCursor('up');
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
		if(CapoRSS.router.itemList !== null) {
			if(e.keyCode == 74) { // J
				// Next item
				CapoRSS.router.itemList.moveCursor('down');
			}
			if(e.keyCode == 75) { // K
				// Previous item
				CapoRSS.router.itemList.moveCursor('up');
			}

			if(e.keyCode == 32) { // SPACE
				// Page down in the item list. Change selected item if necessary.
				if(CapoRSS.router.itemList.cursor === null || CapoRSS.router.itemList.cursor === undefined) {
					CapoRSS.router.itemList.moveCursor('down');
				}
				else {
					container = $('#item-list').eq(0);
					currentItem = $('.item-container.active').eq(0).closest('li');
					var limit = container.scrollTop() + currentItem.position().top + currentItem.height();

					if(container.scrollTop() + $(window).height() > limit) {
						CapoRSS.router.itemList.moveCursor('down');
					}
					else {
						container.scrollTop($(window).height() + container.scrollTop());
					}
				}

				return false;
			}
		}

		if(e.keyCode == 82) { // R
			CapoRSS.folders.refresh();
		}
		if(e.keyCode == 83) { // S
			CapoRSS.mainMenu.sync();
		}
		if(e.keyCode == 72) { // H
			CapoRSS.mainMenu.toggleReadVisibility();
		}
		if(e.keyCode == 111 || e.keyCode == 191) { // /
			CapoRSS.mainMenu.toggleSearchFilters();
		}
		if(e.keyCode == 65) { // A
			CapoRSS.mainMenu.showSubscriptionModal();
		}
	}
});

// Prevent default browser behaviors
$(document).keydown(function(e) {
	if(e.keyCode == 32) { // SPACE
		e.preventDefault();
	}
	if(e.keyCode == 111 || e.keyCode == 191) { // /
		e.preventDefault();
	}
});
