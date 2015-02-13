'use strict';

// Quizzes controller
angular.module('play').controller('PlayController', ['$scope', '$stateParams', '$location', '$sce', 'Authentication', 'Play',
	function($scope, $stateParams, $location, $sce, Authentication, Play) {
		$scope.authentication = Authentication;

		$scope.responded = true;

		$scope.questionLoading = true;

		var init = function(){
			//callback after question data received
			$scope.questionLoading = false;
			$scope.responded = true;

			console.log($scope.question);
			console.log($scope.question.questionImage);
			console.log();

			if($scope.question.error){
				$scope.error = $scope.question.error;
				console.log($scope.question);
				if($scope.question.returnedId){
					$scope.linkToQuiz = '/#!/play/' + $scope.question.returnedId;
				}
			}
		};

		var findOneCallback = function(){
			console.log('called back');
			setTimeout(function(){
				if(!$scope.question){
					console.log(' no question');
					$scope.responded = false;
				}
				else{
					console.log('question');
				}
			}, 5000);
		};

		$scope.findOne = function() {
			$scope.questionLoading = true;
			findOneCallback();
			$scope.question = Play.get({
				quizId: $stateParams.quizId
			}, init);
		};

		$scope.submitAnswer = function(){
			console.log($scope.question.userAnswer);
			var callback = function(res){
				console.log(res.nextQuestion);
				if(res.nextQuestion === 'error'){
					$scope.error = res.error;
				}
				$scope.question = res.nextQuestion;
				init();
			};
			Play.save({quizId: $stateParams.quizId},{userAnswer: $scope.question.userAnswer},callback);
		};

		$scope.quizId = $stateParams.quizId;
	}
]);
