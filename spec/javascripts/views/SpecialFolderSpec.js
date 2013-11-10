describe("Special Folder View", function() {
	beforeEach(function() {
		CapoRSS.router = {
			navigate: function(path, options) {}
		};

		this.folder = new CapoRSS.Model.AllItemsFolder();
		this.view = new CapoRSS.View.SpecialFolder({model: this.folder});
		this.view.render();
	});

	describe("Instantiation", function() {
		it("creates a list element", function() {
			expect(this.view.el.nodeName).toEqual("LI");
		});
	});

	describe("Rendering", function() {
		it("renders the folder name", function() {
			expect(this.view.$el.find('.folder-text').html()).toContain('all_items_folder');
		});

		it("renders the folder icon", function() {
			expect(this.view.$el.find('.folder-icon')).toHaveClass('fa-asterisk');
		});
	});

	describe("Actions", function() {
		it("navigates to the specified route when clicked", function() {
			sinon.spy(CapoRSS.router, 'navigate');

			this.view.$el.find('.folder-title').trigger('click');

			expect(CapoRSS.router.navigate).toHaveBeenCalledOnce();
			expect(CapoRSS.router.navigate).toHaveBeenCalledWith('item', {trigger: true});

			CapoRSS.router.navigate.restore();
		});
	});
});
