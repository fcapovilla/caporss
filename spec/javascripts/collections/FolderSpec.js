describe("Folder Collection", function() {
	beforeEach(function() {
		this.server = create_fake_server();

		this.folders = new CapoRSS.Collection.Folder();
	});

	it("fetches each folder's feeds on collection fetch", function() {
		this.folders.fetch();

		expect(this.server.requests.length).toEqual(1);
		expect(this.server.requests[0].method).toEqual("GET");
		expect(this.server.requests[0].url).toEqual("/api/folder");

		this.server.respond();

		expect(this.server.requests.length).toEqual(3);
		expect(this.server.requests[1].method).toEqual("GET");
		expect(this.server.requests[1].url).toEqual("/api/folder/1/feed");
		expect(this.server.requests[2].method).toEqual("GET");
		expect(this.server.requests[2].url).toEqual("/api/folder/2/feed");
	});

	it("returns the full collection's item count", function() {
		this.folders.fetch();
		this.server.respond();

		var ret = this.folders.getUnreadCount();

		expect(ret).toEqual(3);
	});

	it("updates the page's title with the unread item count", function() {
		//TODO : this.folders.refreshUnreadCount();
	});

	it("returns an associative array of all feed titles", function() {
		this.folders.fetch();
		this.server.respond();

		var ret = this.folders.getFeedTitles();

		expect(ret[1]).toEqual("Test 1");
		expect(ret[2]).toEqual("Test 2");
		expect(ret[3]).toEqual("Test 3");
		expect(ret[4]).toEqual("Test 4");
	});

	afterEach(function() {
		this.server.restore();
		document.title = "Jasmine suite";
	});
});
