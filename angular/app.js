// Declare app level module which depends on filters, and services
angular.module('caporss', ['ngSanitize', 'caporss.filters', 'caporss.services', 'caporss.directives', 'caporss.controllers']).
	config(['$routeProvider', function($routeProvider) {
		$routeProvider.when('/item', {templateUrl: 'angular/itemlist.html', controller: 'AllItemsCtrl'});
		$routeProvider.when('/folder/:id', {templateUrl: 'angular/itemlist.html', controller: 'FolderItemListCtrl'});
		$routeProvider.when('/feed/:id', {templateUrl: 'angular/itemlist.html', controller: 'FeedItemListCtrl'});
		$routeProvider.otherwise({redirectTo: '/item'});
	}]);
