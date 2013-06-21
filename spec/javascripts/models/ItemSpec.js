describe("Item Model", function() {
	beforeEach(function() {
		this.server = sinon.fakeServer.create();
		this.server.respondWith("PUT", "/item/1", [200, '', '']);

		this.item = new Item({id: 1, read: false, feed_id: 1});
		this.item.collection = {url: '/item'};
	});

	it("can toggle its read attribute", function() {
		var readSpy = sinon.spy();
		var unreadSpy = sinon.spy();
		this.item.bind('itemRead', readSpy);
		this.item.bind('itemUnread', unreadSpy);

		expect(this.item.get('read')).toEqual(false);

		this.item.toggleRead();

		expect(this.server.requests.length).toEqual(1);
		expect(this.server.requests[0].method).toEqual("PUT");
		expect(this.server.requests[0].url).toEqual("/item/1");
		expect(this.item.get('read')).toEqual(true);
		expect(readSpy).toHaveBeenCalledOnce();
		expect(readSpy).toHaveBeenCalledWith(this.item.get('feed_id'));


		this.item.toggleRead();

		expect(this.server.requests.length).toEqual(2);
		expect(this.server.requests[1].method).toEqual("PUT");
		expect(this.server.requests[1].url).toEqual("/item/1");
		expect(this.item.get('read')).toEqual(false);
		expect(unreadSpy).toHaveBeenCalledOnce();
		expect(unreadSpy).toHaveBeenCalledWith(this.item.get('feed_id'));
	});

	it("can send additional actions via PUT", function() {
		this.item.sendAction('readOlder');

		expect(this.server.requests.length).toEqual(1);
		expect(this.server.requests[0].method).toEqual("PUT");
		expect(this.server.requests[0].url).toEqual("/item/1");
		expect(this.server.requests[0].requestBody).toEqual(JSON.stringify({action: 'readOlder'}));

		this.server.respond();
	});

	afterEach(function() {
		this.server.restore();
	});
});
