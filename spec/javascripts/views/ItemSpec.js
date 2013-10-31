describe("Item View", function() {
	beforeEach(function() {
		this.server = create_fake_server();

		CapoRSS.router = {
			currentSelection: null,
			navigate: function(path, options) {},
			itemList: {
				cursor: null,
				closeCursor: function() {
					CapoRSS.router.itemList.cursor = null;
				},
			}
		};

		this.item = new CapoRSS.Model.Item({
			id: 1,
			feed_id: 1,
			title: 'Test 1',
			url: 'http://example.com/1',
			content: 'Content 1',
			date: '2010-12-10T01:02:03+00:00',
			attachment_url: 'http://example.com/1.zip',
			read: false
		});
		this.item.collection = {url: '/api/item'};
		this.view = new CapoRSS.View.Item({model: this.item});
		this.view.render();
	});

	describe("Instantiation", function() {
		it("creates a list element", function() {
			expect(this.view.el.nodeName).toEqual("LI");
		});
	});

	describe("Rendering", function() {
		it("renders the item title", function() {
			expect(this.view.$el.find('.item-title').text()).toContain('Test 1');
		});

		it("renders the formatted item date", function() {
			// A regex is used to prevent timezone problems.
			expect(this.view.$el.find('.item-date').text()).toMatch(/..?\/12\/2010 ..?:..?:..?/);
		});

		describe("Unread item", function() {
			it("renders the item name in bold", function() {
				expect(this.view.$el.find('.item-title').html()).toContain('<b>');
			});
		});

		describe("Read item", function() {
			beforeEach(function() {
				this.item.set('read', true);
			});

			it("doesn't renders the item name in bold", function() {
				expect(this.view.$el.find('.item-title').html()).not.toContain('<b>');
			});
		});

		describe("Closed content", function() {
			it("doesn't show the item's content", function() {
				expect(this.view.$el.find('.item-content').length).toEqual(0);
			});
		});

		describe("Opened content", function() {
			beforeEach(function() {
				this.view.$el.find('.item-container').trigger('click');
			});

			it("shows the item's content, title and attachment", function() {
				expect(this.view.$el.find('.item-content').html()).toContain('Content 1');
				expect(this.view.$el.find('.item-content-title').html()).toContain('Test 1');
				expect(this.view.$el.find('.item-content-title').attr('href')).toContain('http://example.com/1');
				expect(this.view.$el.find('.item-content .btn').attr('href')).toContain('http://example.com/1.zip');
			});

			it("closes when the container is clicked", function() {
				this.view.$el.find('.item-container').trigger('click');
				expect(this.view.$el.find('.item-content').length).toEqual(0);
			});
		});
	});

	describe("Menu", function() {
		beforeEach(function() {
			this.view.$el.find('.dropdown-toggle').trigger('click');
			sinon.spy(this.item, 'sendAction');
		});

		it("can send the read_newer action", function() {
			this.view.$el.find('.readNewerAction').trigger('click');
			this.server.respond();

			expect(this.item.sendAction).toHaveBeenCalledWith('read_newer');
		});

		it("can send the unread_newer action", function() {
			this.view.$el.find('.unreadNewerAction').trigger('click');
			this.server.respond();

			expect(this.item.sendAction).toHaveBeenCalledWith('unread_newer');
		});

		it("can send the read_older action", function() {
			this.view.$el.find('.readOlderAction').trigger('click');
			this.server.respond();

			expect(this.item.sendAction).toHaveBeenCalledWith('read_older');
		});

		it("can send the unread_older action", function() {
			this.view.$el.find('.unreadOlderAction').trigger('click');
			this.server.respond();

			expect(this.item.sendAction).toHaveBeenCalledWith('unread_older');
		});

		afterEach(function() {
			this.item.sendAction.restore();
		});
	});

	it("marks the item as read/unread when the readUnreadIcon is clicked", function() {
		this.view.$el.find('.readUnreadIcon').trigger('click');

		expect(this.item.get('read')).toEqual(true);

		this.view.$el.find('.readUnreadIcon').trigger('click');

		expect(this.item.get('read')).toEqual(false);
	});
});
