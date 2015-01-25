'use strict';

// Quizzes controller
angular.module('play').controller('PlayController', ['$scope', '$stateParams', '$location', '$sce', 'Authentication',
	function($scope, $stateParams, $location, $sce, Authentication) {
		$scope.authentication = Authentication;
	}
]);
