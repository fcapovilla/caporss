describe("Item Model", function() {
	it("Can be created", function() {
		var item = new Item();
		item.set('read', false);
		expect(item.get('read')).toEqual(false);
	});
});
