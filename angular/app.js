// Declare app level module which depends on filters, and services
angular.module('caporss', ['ngSanitize', 'caporss.filters', 'caporss.services', 'caporss.directives', 'caporss.controllers']).
	config(['$routeProvider', function($routeProvider) {
		$routeProvider.when('/item', {templateUrl: 'angular/itemlist.html', controller: 'ItemListCtrl'});
		$routeProvider.when('/folder/:folderId', {templateUrl: 'angular/itemlist.html', controller: 'ItemListCtrl'});
		$routeProvider.when('/feed/:feedId', {templateUrl: 'angular/itemlist.html', controller: 'ItemListCtrl'});
		$routeProvider.otherwise({redirectTo: '/item'});
	}]);
