describe("Feed Model", function() {
	beforeEach(function() {
		this.server = sinon.fakeServer.create();
		this.server.respondWith("PUT", "/api/feed/1", [200, '', '']);

		this.feed = new CapoRSS.Model.Feed({id: 1, folder_id: 1, unread_count: 1});
		this.feed.collection = {url: '/api/feed'};
	});

	it("can mark its items as read/unread", function() {
		expect(this.feed.get('unread_count')).toEqual(1);

		this.feed.markRead();

		expect(this.server.requests.length).toEqual(1);
		expect(this.server.requests[0].method).toEqual("PUT");
		expect(this.server.requests[0].url).toEqual("/api/feed/1");
		expect(this.server.requests[0].requestBody).toEqual(JSON.stringify({action: 'read'}));

		this.server.respond();

		expect(this.feed.get('unread_count')).toEqual(0);

		this.feed.markUnread();

		expect(this.server.requests.length).toEqual(2);
		expect(this.server.requests[1].method).toEqual("PUT");
		expect(this.server.requests[1].url).toEqual("/api/feed/1");
		expect(this.server.requests[1].requestBody).toEqual(JSON.stringify({action: 'unread'}));

		this.server.respond();

		expect(this.server.requests.length).toEqual(3);
		expect(this.server.requests[2].method).toEqual("GET");
		expect(this.server.requests[2].url).toEqual("/api/feed/1");
	});

	it("updates its read count when receiving read/unread events from its items collection", function() {
		this.feed.items.trigger('itemUnread');

		expect(this.feed.get('unread_count')).toEqual(2);

		this.feed.items.trigger('itemRead');

		expect(this.feed.get('unread_count')).toEqual(1);
	});

	afterEach(function() {
		this.server.restore();
	});
});
