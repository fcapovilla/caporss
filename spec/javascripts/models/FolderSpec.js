describe("Folder Model", function() {
	beforeEach(function() {
		this.server = create_fake_server();

		this.folder = new CapoRSS.Model.Folder({id: 1, unread_count: 1, open: false});
		this.folder.collection = {url: '/api/folder'};
	});

	it("fetches its feeds when initialized", function() {
		expect(this.server.requests.length).toEqual(1);
		expect(this.server.requests[0].method).toEqual("GET");
		expect(this.server.requests[0].url).toEqual("/api/folder/1/feed");
	});

	it("can be toggled open/closed", function() {
		expect(this.folder.get('open')).toEqual(false);

		this.folder.toggle();

		expect(this.server.requests.length).toEqual(2);
		expect(this.server.requests[1].method).toEqual("PUT");
		expect(this.server.requests[1].url).toEqual("/api/folder/1");
		expect(this.folder.get('open')).toEqual(true);

		this.folder.toggle();

		expect(this.server.requests.length).toEqual(3);
		expect(this.server.requests[2].method).toEqual("PUT");
		expect(this.server.requests[2].url).toEqual("/api/folder/1");
		expect(this.folder.get('open')).toEqual(false);
	});

	it("updates his own and his feeds' unread count when receving read/unread events from its items collection", function() {
		this.server.respond();
		this.folder.items.trigger('itemUnread', 1);

		expect(this.folder.get('unread_count')).toEqual(3);
		expect(this.folder.feeds.get(1).get('unread_count')).toEqual(2);

		this.folder.items.trigger('itemRead', 1);

		expect(this.folder.get('unread_count')).toEqual(2);
		expect(this.folder.feeds.get(1).get('unread_count')).toEqual(1);
	});

	it("fetches its feeds when fetched", function() {
		this.folder.fetch();

		expect(this.server.requests.length).toEqual(2);
		expect(this.server.requests[1].method).toEqual("GET");
		expect(this.server.requests[1].url).toEqual("/api/folder/1");

		this.server.respond();

		expect(this.server.requests.length).toEqual(3);
		expect(this.server.requests[2].method).toEqual("GET");
		expect(this.server.requests[2].url).toEqual("/api/folder/1/feed");
	});

	afterEach(function() {
		this.server.restore();
	});
});
