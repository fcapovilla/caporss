angular.module('caporss.services', ['ngResource']).
	factory('Item', function($resource){
		return $resource('/:base/:baseId/item/:id', {limit:100,offset:0}, {
		});
	})
	.factory('Folder', function($resource){
		return $resource('/folder/:id', {}, {
		});
	})
	.factory('Feed', function($resource){
		return $resource('/:base/:baseId/feed/:id', {}, {
		});
	});
