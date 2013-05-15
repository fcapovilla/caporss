angular.module('caporss.filters', []).
	filter('interpolate', ['ie', function() {
		return function(v, yes, no){
			return v ? yes : no;
		};
	}]);
