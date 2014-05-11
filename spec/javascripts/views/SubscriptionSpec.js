describe("Subscription View", function() {
	beforeEach(function() {
		this.server = create_fake_server();

		this.feed = new CapoRSS.Model.Feed({
			id: 1,
			folder_id: 1,
			unread_count: 1,
			title: 'Test 1',
			last_update: '2010-12-10T01:02:03',
			sync_error: 404,
			pshb_hub: 'http://www.example.com',
			pshb: 'inactive'
		});
		this.feed.collection = {url: '/api/feed'};
		this.view = new CapoRSS.View.Subscription({model: this.feed});

		CapoRSS.router = {
			currentSelection: null
		};

		this.view.render();
	});

	describe("Rendering", function() {
		it("displays feed row", function() {
			expect(this.view.$el.html()).toContain("Test 1");
		});

		it("displays feed sync error", function() {
			expect(this.view.$el.html()).toContain("404");
		});

		it("displays the last update date with formatting", function() {
			expect(this.view.$el.html()).toMatch(/\d\d\/12\/2010 \d\d:02:03/);
		});
	});

	describe("Actions", function() {
		describe("Delete button", function() {
			beforeEach(function() {
				sinon.spy(this.feed, 'destroy');
			});

			it("deletes the feed on confirmation", function() {
				spyOn(window, 'confirm').and.returnValue(true);
				this.view.$el.find('.deleteFeedAction').trigger('click');

				expect(this.feed.destroy).toHaveBeenCalledOnce();
			});

			it("doesn't delete the feed without confirmation", function() {
				spyOn(window, 'confirm').and.returnValue(false);
				this.view.$el.find('.deleteFeedAction').trigger('click');

				expect(this.feed.destroy).not.toHaveBeenCalledOnce();
			});

			afterEach(function() {
				this.feed.destroy.restore();
			});
		});

		it("toggles PubSubHubBub on the feed when the PSHB checkbox is clicked", function() {
			this.view.$el.find('.togglePSHBAction').trigger('click');

			expect(this.server.requests.length).toEqual(1);
			expect(this.server.requests[0].method).toEqual("PUT");
			expect(this.server.requests[0].url).toEqual("/api/feed/1");

			this.server.respond();

			expect(this.feed.get('pshb')).toEqual('requested');

			this.view.$el.find('.togglePSHBAction').trigger('click');

			expect(this.server.requests.length).toEqual(2);
			expect(this.server.requests[1].method).toEqual("PUT");
			expect(this.server.requests[1].url).toEqual("/api/feed/1");

			this.server.respond();

			expect(this.feed.get('pshb')).toEqual('inactive');
		});
	});
});
