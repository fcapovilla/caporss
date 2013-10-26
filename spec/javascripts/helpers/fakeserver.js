function create_fake_server() {
	var server = sinon.fakeServer.create();

	server.respondWith("GET", "/api/folder", [200, '',
		JSON.stringify([
			{id: 1, unread_count: 2},
			{id: 2, unread_count: 1}
		])
	]);
	server.respondWith("GET", "/api/folder/1", [200, '',
		JSON.stringify([{
			id: 1,
			unread_count: 2,
			open: false
		}])
	]);
	server.respondWith("PUT", "/api/folder/1", [200, '', '']);

	server.respondWith("GET", "/api/folder/1/feed", [200, '',
		JSON.stringify([
			{id: 1, unread_count: 1, title: "Test 1", folder_id: 1},
			{id: 2, unread_count: 1, title: "Test 2", folder_id: 1}
		])
	]);
	server.respondWith("GET", "/api/folder/2/feed", [200, '',
		JSON.stringify([
			{id: 3, unread_count: 1, title: "Test 3"},
			{id: 4, unread_count: 0, title: "Test 4"}
		])
	]);
	server.respondWith("PUT", "/api/feed/1", [200, '', '']);

	server.respondWith("GET", "/api/item?limit=2", [200, '',
		JSON.stringify([
			{id: 1, read: false, feed_id: 1},
			{id: 2, read: false, feed_id: 1},
		])
	]);
	server.respondWith("GET", "/api/item?offset=2&limit=2", [200, '','[]']);
	server.respondWith("PUT", "/api/item/1", [200, '', '']);

	return server;
}
