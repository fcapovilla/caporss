describe("Main Menu View", function() {
	beforeEach(function() {
		this.server = create_fake_server();

		CapoRSS.router = {
			currentSelection: null,
			itemList: {
				moveCursor: function(direction) {}
			}
		};

		this.view = new CapoRSS.View.MainMenu({el: null});
		this.view.render();
	});

	describe("Rendering", function() {
		it("displays menu buttons", function() {
			expect(this.view.$el.find('#syncButton').length).toEqual(1);
			expect(this.view.$el.find('#subscriptionModalButton').length).toEqual(1);
			expect(this.view.$el.find('#settingsModalButton').length).toEqual(1);
			expect(this.view.$el.find('#mobilePrevItem').length).toEqual(1);
			expect(this.view.$el.find('#mobileNextItem').length).toEqual(1);
			expect(this.view.$el.find('#toggleReadVisibility').length).toEqual(1);
		});
	});

	describe("Actions", function() {
		it("initiates a sync when clicking the sync button", function() {
			this.view.$el.find('#syncButton').trigger('click');

			expect(this.server.requests.length).toEqual(1);
			expect(this.server.requests[0].method).toEqual("POST");
			expect(this.server.requests[0].url).toEqual("/sync/all");

			this.server.respond();
		});

		/*
		it("displays the subscription dialog when clicking the subscription button", function() {
		});

		it("displays the settings dialog when clicking the settings button", function() {
		});
		*/

		it("can select the next item in the item list", function() {
			sinon.spy(CapoRSS.router.itemList, 'moveCursor');

			this.view.$el.find('#mobileNextItem').trigger('click');

			expect(CapoRSS.router.itemList.moveCursor).toHaveBeenCalledOnce();
			expect(CapoRSS.router.itemList.moveCursor).toHaveBeenCalledWith('down');

			CapoRSS.router.itemList.moveCursor.restore();
		});

		it("can select the previous item in the item list", function() {
			sinon.spy(CapoRSS.router.itemList, 'moveCursor');

			this.view.$el.find('#mobilePrevItem').trigger('click');

			expect(CapoRSS.router.itemList.moveCursor).toHaveBeenCalledOnce();
			expect(CapoRSS.router.itemList.moveCursor).toHaveBeenCalledWith('up');

			CapoRSS.router.itemList.moveCursor.restore();
		});

		it("toggles the read visibility when clicking the toggleReadVisibility button", function() {
			this.view.$el.find('#toggleReadVisibility').trigger('click');

			expect(SETTINGS.show_read).toEqual(false);

			this.view.$el.find('#toggleReadVisibility').trigger('click');

			expect(SETTINGS.show_read).toEqual(true);
		});
	});
});
