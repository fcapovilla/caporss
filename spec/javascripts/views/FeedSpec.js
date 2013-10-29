describe("Feed View", function() {
	beforeEach(function() {
		this.server = create_fake_server();

		CapoRSS.router = {
			currentSelection: null,
			navigate: function(path, options) {}
		};

		this.feed = new CapoRSS.Model.Feed({id: 1, folder_id: 1, unread_count: 5, title: 'Test 1'});
		this.feed.collection = {url: '/api/feed'};
		this.view = new CapoRSS.View.Feed({model: this.feed});
		this.view.render();
	});

	describe("Instantiation", function() {
		it("creates a list element", function() {
			expect(this.view.el.nodeName).toEqual("LI");
		});

		it("has class feed", function() {
			expect(this.view.$el.hasClass('feed')).toBeTruthy();
		});
	});

	describe("Rendering", function() {
		it("renders the feed name", function() {
			expect(this.view.$el.find('.feed-text').text()).toContain('Test 1');
		});

		describe("Unread feed", function() {
			it("renders the feed name in bold", function() {
				expect(this.view.$el.find('.feed-text').html()).toContain('<b>');
			});

			it("renders the feed's unread count", function() {
				expect(this.view.$el.find('.feed-badge .badge').text()).toContain('5');
			});
		});

		describe("Read feed", function() {
			beforeEach(function() {
				this.feed.set('unread_count', 0);
			});

			it("doesn't renders the feed name in bold", function() {
				expect(this.view.$el.find('.feed-text').html()).not.toContain('<b>');
			});

			it("doesn't render the feed's unread count", function() {
				expect(this.view.$el.find('.feed-badge').length).toEqual(0);
			});
		});
	});

	describe("Menu", function() {
		beforeEach(function() {
			this.view.$el.find('.feed-icon').trigger('click');
		});

		it("appears when favicon is clicked", function() {
			expect(this.view.$el.find('.feedMenu').hasClass('hide')).not.toBeTruthy();
		});

		it("closes when a click is done anywhere on the page", function() {
			$('body').trigger('click');
			expect(this.view.$el.find('.feedMenu').hasClass('hide')).toBeTruthy();
		});

		describe("Mark read button", function() {
			it("marks all feed items as read", function() {
				sinon.spy(this.feed, 'markRead');

				this.view.$el.find('.markFeedReadAction').trigger('click');
				expect(this.feed.markRead).toHaveBeenCalledOnce();

				this.feed.markRead.restore();
			});
		});

		describe("Mark unread button", function() {
			it("marks all feed items as unread", function() {
				sinon.spy(this.feed, 'markUnread');

				this.view.$el.find('.markFeedUnreadAction').trigger('click');
				expect(this.feed.markUnread).toHaveBeenCalledOnce();

				this.feed.markUnread.restore();
			});
		});

		describe("Sync button", function() {
			it("triggers a sync for this feed", function() {
				this.view.$el.find('.syncFeedAction').trigger('click');

				expect(this.server.requests.length).toEqual(1);
				expect(this.server.requests[0].method).toEqual("POST");
				expect(this.server.requests[0].url).toEqual("/sync/feed/1");
			});
		});

		/*
		describe("Edit button", function() {
			it("fills and displays the feed edition dialog", function() {
				this.view.$el.find('.editFeedAction').trigger('click');
			});
		});
		*/

		describe("Delete button", function() {
			it("deletes the feed on confirmation", function() {
				spyOn(window, 'confirm').andReturn(true);
				sinon.spy(this.feed, 'destroy');

				this.view.$el.find('.deleteFeedAction').trigger('click');

				expect(this.feed.destroy).toHaveBeenCalledOnce();

				this.feed.destroy.restore();
			});

			it("doesn't delete the feed without confirmation", function() {
				spyOn(window, 'confirm').andReturn(false);
				sinon.spy(this.feed, 'destroy');

				this.view.$el.find('.deleteFeedAction').trigger('click');

				expect(this.feed.destroy).not.toHaveBeenCalledOnce();

				this.feed.destroy.restore();
			});
		});
	});

	it("gets selected when clicked", function() {
		sinon.spy(CapoRSS.router, 'navigate');

		this.view.$el.find('.feed-title').trigger('click');

		expect(CapoRSS.router.navigate).toHaveBeenCalledOnce();
		expect(CapoRSS.router.navigate).toHaveBeenCalledWith('feed/1');

		CapoRSS.router.navigate.restore();
	});
});
