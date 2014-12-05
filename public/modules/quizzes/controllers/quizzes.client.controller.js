'use strict';

// Quizzes controller
angular.module('quizzes').controller('QuizzesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Quizzes',
	function($scope, $stateParams, $location, Authentication, Quizzes, Question ) {
		$scope.authentication = Authentication;
		// Create new Quiz
		$scope.create = function() {
			// Create new Quiz object
			var quiz = new Quizzes ({
				summary: {
					name: this.name,
					desc: this.desc
				},
				questions: [{
					'title': '',
					'hint': '',
					'answer': [],
					'wrongAnswers': []
				}],
				settings: {}
			});

			// Redirect after save
			quiz.$save(function(response) {
				$location.path('quizzes/' + response._id + '/edit');

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Quiz
		$scope.remove = function( quiz ) {
			if ( quiz ) { quiz.$remove();

				for (var i in $scope.quizzes ) {
					if ($scope.quizzes [i] === quiz ) {
						$scope.quizzes.splice(i, 1);
					}
				}
			} else {
				$scope.quiz.$remove(function() {
					$location.path('quizzes');
				});
			}
		};

		// Find a list of Quizzes
		$scope.find = function() {
			$scope.quizzes = Quizzes.query();
		};

		// Find existing Quiz
		$scope.findOne = function() {
			$scope.quiz = Quizzes.get({
				quizId: $stateParams.quizId
			});
		};

		/*
			Questions page
		 */

		$scope.addAnswer = function(){
			var quiz = $scope.quiz;
			quiz.questions[$scope.currentPage-1].answer.push('');
		};

		$scope.delAnswer = function(){
			var quiz = $scope.quiz;
			quiz.questions[$scope.currentPage-1].answer.pop();
		};

		$scope.addWrongAnswer = function(){
			var quiz = $scope.quiz;
			quiz.questions[$scope.currentPage-1].wrongAnswers.push('');
		};

		$scope.delWrongAnswer = function(){
			var quiz = $scope.quiz;
			quiz.questions[$scope.currentPage-1].wrongAnswers.pop();
		};


		// Update existing Quiz
		$scope.update = function() {
			var quiz = $scope.quiz;

			quiz.$update(function () {
				$location.path('quizzes/' + quiz._id + '/edit');
				$scope.error = undefined;
			}, function (errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.updateQuestion = function() {
			var quiz = $scope.quiz;

			var pushQuestion = function(){
				quiz.questions.push({
					'title': '',
					'hint': '',
					'answer': [''],
					'wrongAnswers': []
				});
			};

			quiz.$update(function () {
				$location.path('quizzes/' + quiz._id + '/edit');
				pushQuestion();
				$scope.error = undefined;
				$scope.currentPage++;
				$scope.numPages++;
			},function(errorResponse) {
					console.log(errorResponse);
					$scope.error = errorResponse.data.message;
				}
			);
		};

		$scope.delQuestion = function(){
			if($scope.currentPage === $scope.quiz.questions.length){
				$scope.quiz.questions.pop();
				$scope.currentPage --;
			}
			else {
				$scope.quiz.questions.splice($scope.currentPage - 1, 1);
			}
			$scope.update();
			$scope.numPages --;
		};

		$scope.nextQuestion = function() {
			console.log('next clicked');
			if ($scope.currentPage === $scope.quiz.questions.length) {
				$scope.updateQuestion();
			}
			else {
				$scope.currentPage++;
				$scope.update();
			}
		};

		$scope.prevQuestion = function(){
			$scope.currentPage --;
			$scope.update();
		};

		$scope.numPages = 1;
		$scope.currentPage = 1;
		$scope.maxSize = 10;

	}
]);
