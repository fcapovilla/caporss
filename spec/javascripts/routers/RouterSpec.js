describe("AppRouter routes", function() {
	beforeEach(function() {
		this.router = new Router();
		this.routeSpy = sinon.spy();

		try {
			Backbone.history.start({silent:true, pushState:true});
		} catch(e) {}

		this.router.navigate("nowhere");
	});

	it("fires the clear route with a blank hash", function() {
		this.router.bind("route:clear", this.routeSpy);
		this.router.navigate("", true);

		expect(this.routeSpy).toHaveBeenCalledOnce();
		expect(this.routeSpy).toHaveBeenCalledWith();
	});

	/*
	it("fires the feed items route", function() {
		this.router.bind("route:viewFeed", this.routeSpy);
		this.router.navigate("/feed/1", true);

		expect(this.routeSpy).toHaveBeenCalledOnce();
		expect(this.routeSpy).toHaveBeenCalledWith(1);
	});

	it("fires the folder items route", function() {
		this.router.bind("route:viewFolder", this.routeSpy);
		this.router.navigate("/folder/1", true);

		expect(this.routeSpy).toHaveBeenCalledOnce();
		expect(this.routeSpy).toHaveBeenCalledWith(1);
	});

	it("fires the items route", function() {
		this.router.bind("route:viewAllItems", this.routeSpy);
		this.router.navigate("/item", true);

		expect(this.routeSpy).toHaveBeenCalledOnce();
		expect(this.routeSpy).toHaveBeenCalledWith();
	});
	*/
});
