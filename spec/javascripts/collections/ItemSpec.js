describe("Item Collection", function() {
	beforeEach(function() {
		this.server = sinon.fakeServer.create();
		this.server.respondWith("GET", "/item?limit=2", [200, '',
			JSON.stringify([
				{id: 1, read: false, feed_id: 1},
				{id: 2, read: false, feed_id: 1},
			])
		]);
		this.server.respondWith("GET", "/item?offset=2&limit=2", [200, '','[]']);

		this.items = new ItemCollection();

		SETTINGS.items_per_page = 2;
		SETTINGS.show_read = true;
	});

	describe("fetch method", function() {
		it("can fetch new items", function() {
			expect(this.items.length).toEqual(0);

			this.items.fetch();

			expect(this.server.requests.length).toEqual(1);
			expect(this.server.requests[0].method).toEqual("GET");
			expect(this.server.requests[0].url).toEqual("/item?limit=2");

			this.server.respond();

			expect(this.items.length).toEqual(2);
		});

		it("keep query and search_title values for future fetchs", function() {
			this.items.fetch({data: {
				limit: 5,
				offset: 10,
				query: 'test',
				search_title: true,
				show_read: false
			}});

			expect(this.server.requests.length).toEqual(1);
			expect(this.server.requests[0].method).toEqual("GET");
			expect(this.server.requests[0].url).toEqual("/item?limit=5&offset=10&query=test&search_title=true&show_read=false");

			this.items.fetch({data: {
				offset: 20,
				show_read: true
			}});

			expect(this.server.requests.length).toEqual(2);
			expect(this.server.requests[1].method).toEqual("GET");
			expect(this.server.requests[1].url).toEqual("/item?offset=20&show_read=true&limit=2&query=test&search_title=true");
		});

		it("gets its default values from SETTINGS", function() {
			SETTINGS.items_per_page = 5;
			SETTINGS.show_read = false;
			this.items.fetch();

			expect(this.server.requests.length).toEqual(1);
			expect(this.server.requests[0].method).toEqual("GET");
			expect(this.server.requests[0].url).toEqual("/item?limit=5&show_read=false");

			SETTINGS.items_per_page = 10;
			SETTINGS.show_read = true;
			this.items.fetch();

			expect(this.server.requests.length).toEqual(2);
			expect(this.server.requests[1].method).toEqual("GET");
			expect(this.server.requests[1].url).toEqual("/item?limit=10");
		});

		it("can fetch each item's feed title", function() {
			// TODO : this.items.show_feed_titles = true;
		});
	});

	it("can fetch item pages", function() {
		var allLoadedSpy = sinon.spy();
		this.items.bind('all_loaded', allLoadedSpy);

		expect(this.items.length).toEqual(0);
		expect(this.items.all_loaded).toEqual(false);

		this.items.fetch();

		expect(this.server.requests.length).toEqual(1);
		expect(this.server.requests[0].method).toEqual("GET");
		expect(this.server.requests[0].url).toEqual("/item?limit=2");
		expect(this.items.current_page).toEqual(1);

		this.server.respond();

		expect(this.items.all_loaded).toEqual(false);
		expect(allLoadedSpy).not.toHaveBeenCalledOnce();
		expect(this.items.length).toEqual(2);

		this.items.fetchNextPage();

		expect(this.server.requests.length).toEqual(2);
		expect(this.server.requests[1].method).toEqual("GET");
		expect(this.server.requests[1].url).toEqual("/item?offset=2&limit=2");
		expect(this.items.current_page).toEqual(2);

		this.server.respond();

		expect(this.items.all_loaded).toEqual(true);
		expect(allLoadedSpy).toHaveBeenCalledOnce();

		var ret = this.items.fetchNextPage();

		expect(ret).toEqual(false);
		expect(this.server.requests.length).toEqual(2);

		this.items.fetch({reset_pagination: true});

		expect(this.server.requests.length).toEqual(3);
		expect(this.server.requests[2].method).toEqual("GET");
		expect(this.server.requests[2].url).toEqual("/item?limit=2");
		expect(this.items.current_page).toEqual(1);
		expect(this.items.all_loaded).toEqual(false);
	});

	afterEach(function() {
		this.server.restore();
	});
});
