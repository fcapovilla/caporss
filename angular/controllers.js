angular.module('caporss.controllers', []).
	controller('ItemListCtrl', ['$scope', '$routeParams', 'Item', function($scope, $routeParams, Item) {
		if($routeParams.folderId) {
			$scope.items = Item.query({base:'folder',baseId:$routeParams.folderId});
		}
		else if($routeParams.feedId) {
			$scope.items = Item.query({base:'feed',baseId:$routeParams.feedId});
		}
		else {
			$scope.items = Item.query();
		}

		$scope.openItem = function(item) {
			if(item.open) {
				item.open = false;
			}
			else {
				$.each($scope.items, function(index, item) {
					item.open = false;
				});
				item.open = true;
			}
		};

		$scope.toggleRead = function(item) {
			item.read = !item.read;
			item.$save();
		};
	}])
	.controller('FeedListCtrl', ['$scope', '$location', 'Folder', 'Feed', function($scope, $location, Folder, Feed) {
		$scope.folders = Folder.query(function() {
			$.each($scope.folders, function(index, folder) {
				folder.feeds = Feed.query({base:'folder',baseId:folder.id});
			});
		});

		$scope.go = function(path) {
			$location.path(path);
		};
	}]);
