describe("Folder List View", function() {
	beforeEach(function() {
		this.server = create_fake_server();

		this.folders = new CapoRSS.Collection.Folder();
		this.view = new CapoRSS.View.FolderList({collection: this.folders, el: null});
		CapoRSS.folderList = this.view;

		// To fetch fake folders
		this.folders.fetch();
		this.server.respond();
	});

	describe("Rendering", function() {
		it("renders all folders", function() {
			expect(this.view.children.length).toEqual(2);
			expect(this.view.$el.find('.folder-text').length).toEqual(3);
		});

		it("renders special folders first", function() {
			expect(this.view.$el.find('.folder-text').eq(0).text()).toContain('all_items_folder');
		});
	});
});
