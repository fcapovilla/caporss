describe("Item Model", function() {
	beforeEach(function() {
		this.server = sinon.fakeServer.create();
		this.server.respondWith("PUT", "/item/1", [200, '', '']);

		this.item = new Item({id: 1, read: false});
		this.item.collection = {url: '/item'};
	});

	it("can toggle its read attribute", function() {
		expect(this.item.get('read')).toEqual(false);

		this.item.toggleRead();

		expect(this.server.requests.length).toEqual(1);
		expect(this.server.requests[0].method).toEqual("PUT");
		expect(this.server.requests[0].url).toEqual("/item/1");

		expect(this.item.get('read')).toEqual(true);

		this.item.toggleRead();

		expect(this.server.requests.length).toEqual(2);
		expect(this.server.requests[1].method).toEqual("PUT");
		expect(this.server.requests[1].url).toEqual("/item/1");

		expect(this.item.get('read')).toEqual(false);
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
