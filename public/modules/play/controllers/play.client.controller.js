'use strict';

// Quizzes controller
angular.module('play').controller('PlayController', ['$scope', '$stateParams', '$location', '$sce', 'Authentication', 'Play',
	function($scope, $stateParams, $location, $sce, Authentication, Play) {
		$scope.authentication = Authentication;

		$scope.findOne = function() {
			$scope.question = Play.get({
				quizId: $stateParams.quizId
			});
		};

		$scope.submitAnswer = function(){
			console.log($scope.question.answerReturn);
			var callback = function(res){
				console.log(res.nextQuestion);
				$scope.question = res.nextQuestion;
			};
			Play.save({quizId: $stateParams.quizId},{answer: $scope.question.answerReturn},callback);
		};

		$scope.quizId = $stateParams.quizId;
	}
]);
