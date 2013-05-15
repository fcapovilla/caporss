angular.module('caporss.services', ['ngResource']).
	factory('Item', function($resource){
		return $resource('/:base/:baseId/item/:id', {limit:100,offset:0}, {
		});
	});
