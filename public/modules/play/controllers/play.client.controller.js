'use strict';

// Quizzes controller
angular.module('play').controller('PlayController', ['$scope', '$stateParams', '$location', '$sce', 'Authentication', 'Play',
	function($scope, $stateParams, $location, $sce, Authentication, Play) {
		$scope.authentication = Authentication;

		$scope.findOne = function() {
			$scope.quiz = Play.get({
				quizId: $stateParams.quizId
			});
		};
	}
]);
