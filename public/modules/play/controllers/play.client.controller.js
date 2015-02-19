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

			if($scope.question.error){
				$scope.error = $scope.question.error;

				if($scope.question.returnedId){
					$scope.linkToQuiz = '/#!/play/' + $scope.question.returnedId;
				}
			}

			$scope.question.displayAnswers = new Array($scope.question.answers.length);//initialise array, faster than push's;
			for(var i = 0; i < $scope.question.answers.length; i++){
				var answerLines = [];
				var wordsInAnswer = $scope.question.answers[i].split(' ');
				for(var index = 0; index < wordsInAnswer.length; index++){
					if( (wordsInAnswer[index] + answerLines[answerLines.length - 1]).length > 36 || wordsInAnswer[index].length > 36) {
						answerLines.push(wordsInAnswer[index]);
					}
					else if(!answerLines[answerLines.length -1]){
						answerLines.push(wordsInAnswer[index]);
					}
					else{
						//
						answerLines[answerLines.length - 1] = '' + answerLines[answerLines.length - 1] + ' ' + wordsInAnswer[index];
					}
				}
				$scope.question.displayAnswers[i] = answerLines;
			}

		};

		var findOneCallback = function(){

			setTimeout(function(){
				if(!$scope.question){

					$scope.responded = false;
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
			var callback = function(res){

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
