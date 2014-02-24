describe("Folder View", function() {
	beforeEach(function() {
		this.server = create_fake_server();

		CapoRSS.router = {
			currentSelection: null,
			navigate: function(path, options) {}
		};

		this.folder = new CapoRSS.Model.Folder({id: 1, unread_count: 2, title: 'Test 1', open: true});
		this.folder.collection = {url: '/api/folder'};
		this.view = new CapoRSS.View.Folder({model: this.folder});

		// To fetch fake feeds
		this.folder.fetch();
		this.server.respond();
		this.view.render();
	});

	describe("Instantiation", function() {
		it("creates a list element", function() {
			expect(this.view.el.nodeName).toEqual("LI");
		});
	});

	describe("Rendering", function() {
		it("renders the folder name", function() {
			expect(this.view.$el.find('.folder-text').text()).toContain('Test 1');
		});

		describe("Unread folder", function() {
			it("renders the folder name in bold", function() {
				expect(this.view.$el.find('.folder-text').html()).toContain('<b>');
			});

			it("renders the folder's unread count", function() {
				expect(this.view.$el.find('.folder-badge .badge').text()).toContain('2');
			});
		});

		describe("Read folder", function() {
			beforeEach(function() {
				this.folder.set('unread_count', 0);
			});

			it("doesn't renders the folder name in bold", function() {
				expect(this.view.$el.find('.folder-text').html()).not.toContain('<b>');
			});

			it("doesn't render the folder's unread count", function() {
				expect(this.view.$el.find('.folder-badge').length).toEqual(0);
			});
		});
	});

	describe("Menu", function() {
		beforeEach(function() {
			this.view.$el.find('.folder-icon').trigger('click');
		});

		it("appears when icon is clicked", function() {
			expect(this.view.$el.find('.folderMenu').hasClass('hide')).not.toBeTruthy();
		});

		it("closes when a click is done anywhere on the page", function() {
			$('body').trigger('click');

			expect(this.view.$el.find('.folderMenu').hasClass('hide')).toBeTruthy();
		});

		describe("Mark read button", function() {
			beforeEach(function() {
				sinon.spy(this.folder.feeds.get(1), 'markRead');
				sinon.spy(this.folder.feeds.get(2), 'markRead');
			});

			it("marks all folder items as read on confirmation", function() {
				spyOn(window, 'confirm').and.returnValue(true);
				this.view.$el.find('.markFolderReadAction').trigger('click');

				expect(this.folder.feeds.get(1).markRead).toHaveBeenCalledOnce();
				expect(this.folder.feeds.get(2).markRead).toHaveBeenCalledOnce();
			});

			it("doesn't mark the folder as read without confirmation", function() {
				spyOn(window, 'confirm').and.returnValue(false);
				this.view.$el.find('.markFolderReadAction').trigger('click');

				expect(this.folder.feeds.get(1).markRead).not.toHaveBeenCalledOnce();
				expect(this.folder.feeds.get(2).markRead).not.toHaveBeenCalledOnce();
			});

			afterEach(function() {
				this.folder.feeds.get(1).markRead.restore();
				this.folder.feeds.get(2).markRead.restore();
			});
		});

		describe("Mark unread button", function() {
			beforeEach(function() {
				sinon.spy(this.folder.feeds.get(1), 'markUnread');
				sinon.spy(this.folder.feeds.get(2), 'markUnread');
			});

			it("marks all folder items as unread on confirmation", function() {
				spyOn(window, 'confirm').and.returnValue(true);
				this.view.$el.find('.markFolderUnreadAction').trigger('click');

				expect(this.folder.feeds.get(1).markUnread).toHaveBeenCalledOnce();
				expect(this.folder.feeds.get(2).markUnread).toHaveBeenCalledOnce();
			});

			it("doesn't mark the folder as unread without confirmation", function() {
				spyOn(window, 'confirm').and.returnValue(false);
				this.view.$el.find('.markFolderUnreadAction').trigger('click');

				expect(this.folder.feeds.get(1).markUnread).not.toHaveBeenCalledOnce();
				expect(this.folder.feeds.get(2).markUnread).not.toHaveBeenCalledOnce();
			});

			afterEach(function() {
				this.folder.feeds.get(1).markUnread.restore();
				this.folder.feeds.get(2).markUnread.restore();
			});
		});

		describe("Sync button", function() {
			it("triggers a sync for this folder", function() {
				this.view.$el.find('.syncFolderAction').trigger('click');

				expect(this.server.requests.length).toEqual(3);
				expect(this.server.requests[2].method).toEqual("POST");
				expect(this.server.requests[2].url).toEqual("/sync/folder/1");
			});
		});

		/*
		describe("Edit button", function() {
			it("fills and displays the folder edition dialog", function() {
				this.view.$el.find('.editFolderAction').trigger('click');
			});
		});
		*/

		describe("Delete button", function() {
			beforeEach(function() {
				sinon.spy(this.folder, 'destroy');
			});

			it("deletes the folder on confirmation", function() {
				spyOn(window, 'confirm').and.returnValue(true);
				this.view.$el.find('.deleteFolderAction').trigger('click');

				expect(this.folder.destroy).toHaveBeenCalledOnce();
			});

			it("doesn't delete the folder without confirmation", function() {
				spyOn(window, 'confirm').and.returnValue(false);
				this.view.$el.find('.deleteFolderAction').trigger('click');

				expect(this.folder.destroy).not.toHaveBeenCalledOnce();
			});

			afterEach(function() {
				this.folder.destroy.restore();
			});
		});
	});

	it("gets selected when clicked", function() {
		sinon.spy(CapoRSS.router, 'navigate');

		this.view.$el.find('.folder-title').trigger('click');

		expect(CapoRSS.router.navigate).toHaveBeenCalledOnce();
		expect(CapoRSS.router.navigate).toHaveBeenCalledWith('folder/1');

		CapoRSS.router.navigate.restore();
	});

	it("closes and opens when the toggle icon is clicked", function() {
		this.view.$el.find('.folder-toggle').trigger('click');

		expect(this.folder.get('open')).toBe(false);
		expect(this.view.$el.find('ul').html()).toBe('');

		this.view.$el.find('.folder-toggle').trigger('click');

		expect(this.folder.get('open')).toBe(true);
		expect(this.view.$el.find('ul').html()).not.toBe('');
	});
});
