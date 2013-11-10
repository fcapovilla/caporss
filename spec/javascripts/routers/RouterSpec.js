describe("AppRouter routes", function() {
	beforeEach(function() {
		this.router = new CapoRSS.Router.Main();
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

	/*
	it("changes the route when a model is send to it", function() {
		sinon.stub(CapoRSS.router, 'navigate').returns(true);

		this.router.goToModel(new CapoRSS.Model.Folder({id: 1}));

		expect(CapoRSS.router.navigate).toHaveBeenCalledOnce();
		expect(CapoRSS.router.navigate).toHaveBeenCalledWith('folder/1', {trigger: true});

		this.router.goToModel(new CapoRSS.Model.Feed({id: 1}));

		expect(CapoRSS.router.navigate).toHaveBeenCalledTwice();
		expect(CapoRSS.router.navigate).toHaveBeenCalledWith('feed/1', {trigger: true});

		this.router.goToModel(new CapoRSS.Model.Item({id: 1}));

		expect(CapoRSS.router.navigate).toHaveBeenCalledThrice();
		expect(CapoRSS.router.navigate).toHaveBeenCalledWith('item', {trigger: true});

		CapoRSS.router.navigate.restore();
	});
	*/
});
