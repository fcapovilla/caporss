describe("Subscription List View", function() {
	beforeEach(function() {
		this.server = create_fake_server();

		this.server.respondWith("GET", "/api/feed", [200, '',
			JSON.stringify([
				{
					id: 1,
					unread_count: 1,
					title: "Test 1",
					folder_id: 1,
					last_update: '2010-12-10T01:02:03+00:00',
				},
				{
					id: 2,
					unread_count: 0,
					title: "Test 2",
					folder_id: 2,
					last_update: '2009-12-10T01:02:03+00:00',
				}
			])
		]);

		this.feeds = new CapoRSS.Collection.Feed();
		this.view = new CapoRSS.View.SubscriptionList({collection: this.feeds, el: null});

		// Fetch fake feeds
		this.view.render();
		this.feeds.fetch();
		this.server.respond();
		this.view.render();
	});

	describe("Rendering", function() {
		it("shows all feeds", function() {
			expect(this.view.$el.find('tbody>tr').eq(0).html()).toContain("Test 1");
			expect(this.view.$el.find('tbody>tr').eq(1).html()).toContain("Test 2");
		});
	});

	describe("Actions", function() {
		it("can change sort column and order", function() {
			this.view.$el.find('.sortable[data-column="title"]').trigger('click');

			expect(this.view.$el.find('tbody>tr').eq(0).html()).toContain("Test 2");
			expect(this.view.$el.find('tbody>tr').eq(1).html()).toContain("Test 1");

			this.view.$el.find('.sortable[data-column="title"]').trigger('click');

			expect(this.view.$el.find('tbody>tr').eq(0).html()).toContain("Test 1");
			expect(this.view.$el.find('tbody>tr').eq(1).html()).toContain("Test 2");

			this.view.$el.find('.sortable[data-column="last_update"]').trigger('click');

			expect(this.view.$el.find('tbody>tr').eq(0).html()).toContain("Test 1");
			expect(this.view.$el.find('tbody>tr').eq(1).html()).toContain("Test 2");

			this.view.$el.find('.sortable[data-column="last_update"]').trigger('click');

			expect(this.view.$el.find('tbody>tr').eq(0).html()).toContain("Test 2");
			expect(this.view.$el.find('tbody>tr').eq(1).html()).toContain("Test 1");
		});
	});
});
