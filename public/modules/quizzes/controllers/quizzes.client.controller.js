'use strict';

// Quizzes controller
angular.module('quizzes').controller('QuizzesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Quizzes',
	function($scope, $stateParams, $location, Authentication, Quizzes, Questions ) {
		$scope.authentication = Authentication;

		// Create new Quiz
		$scope.create = function() {
			// Create new Quiz object
			var quiz = new Quizzes ({
				summary: {
					name: this.name,
					desc: this.desc
				},
				questions: [],
				settings: {}
			});
/*

*/
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

		$scope.appendQuestion = function(){
			var question = new Questions({
				question: this.question,
				hint: this.hint,
				answer: this.answer,
				wrongAnswer: this.wrongAnswer
			});
			var quiz = $scope.quiz;
			console.log(question);
			quiz.questions.push(question);
			console.log(quiz);

		};

		// Update existing Quiz
		$scope.update = function() {
			var quiz = $scope.quiz ;

			quiz.$update(function() {
				$location.path('quizzes/' + quiz._id + '/edit');
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Quizzes
		$scope.find = function() {
			console.log(Quizzes.query());
			$scope.quizzes = Quizzes.query();
		};

		// Find existing Quiz
		$scope.findOne = function() {
			$scope.quiz = Quizzes.get({ 
				quizId: $stateParams.quizId
			});
		};
	}
]);
