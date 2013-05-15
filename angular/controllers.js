angular.module('caporss.controllers', []).
	controller('AllItemsCtrl', ['$scope', 'Item', function($scope, Item) {
		$scope.items = Item.query();
	}])
	.controller('FeedItemListCtrl', ['$scope', '$routeParams', 'Item', function($scope, $routeParams, Item) {
		$scope.items = Item.query({base:'feed',baseId:$routeParams.id});
	}])
	.controller('FolderItemListCtrl', ['$scope', '$routeParams', 'Item', function($scope, $routeParams, Item) {
		$scope.items = Item.query({base:'folder',baseId:$routeParams.id});
	}]);
