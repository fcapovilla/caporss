describe("Item List View", function() {
	beforeEach(function() {
		this.server = create_fake_server();

		this.items = new CapoRSS.Collection.Item();
		this.view = new CapoRSS.View.ItemList({collection: this.items});

		// To fetch fake items
		this.items.fetch();
		this.server.respond();
		this.view.render();
	});

	describe("Rendering", function() {
		it("renders all items", function() {
			expect(this.view.children.length).toEqual(2);
			expect(this.view.$el.find('.item-container').length).toEqual(2);
		});
	});

	describe("Cursor", function() {
		it("selects the first item if none is selected on cursor movement", function() {
			this.view.moveCursor('down');

			expect(this.view.$el.find('.item-container').eq(0).siblings('.item-content').length).toEqual(1);
			expect(this.view.$el.find('.item-container').eq(1).siblings('.item-content').length).toEqual(0);
		});

		it("selects the next item when moving cursor down", function() {
			this.view.moveCursor('down');
			this.view.moveCursor('down');

			expect(this.view.$el.find('.item-container').eq(0).siblings('.item-content').length).toEqual(0);
			expect(this.view.$el.find('.item-container').eq(1).siblings('.item-content').length).toEqual(1);
		});

		it("selects the previous item when moving cursor up", function() {
			this.view.moveCursor('down');
			this.view.moveCursor('down');
			this.view.moveCursor('up');

			expect(this.view.$el.find('.item-container').eq(0).siblings('.item-content').length).toEqual(1);
			expect(this.view.$el.find('.item-container').eq(1).siblings('.item-content').length).toEqual(0);
		});
	});

	describe("Fetch next page button", function() {
		beforeEach(function() {
			sinon.spy(this.items, 'fetchNextPage');
		});

		it("fetches the next page", function() {
			this.view.$el.find('.show_more_items').trigger('click');
			this.server.respond();

			expect(this.items.fetchNextPage).toHaveBeenCalledOnce();
		});

		afterEach(function() {
			this.items.fetchNextPage.restore();
		});
	});
});
