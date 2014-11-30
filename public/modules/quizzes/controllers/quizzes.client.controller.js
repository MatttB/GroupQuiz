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

		// Update existing Quiz
		$scope.update = function() {
			var quiz = $scope.quiz ;
			//console.log(quiz);
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

		/*
			Questions page
		 */

		$scope.tempQuestion = {
			'title': '',
			'hint': '',
			'answer': [],
			'wrongAnswer': []
		};

		//$scope.appendQuestion = function() {
			/*
			 var question = new Question({
			 title: this.title,
			 hint: this.hint,
			 answer: this.answer,
			 wrongAnswer: this.wrongAnswer
			 });
			 */
			//var quiz = $scope.quiz;
			//quiz.questions.push($scope.tempQuestion);

			//console.log('test');
			//$scope.setNumPages();
			//console.log(quiz.questions.length);
		//};

		$scope.updateQuestion = function() {
			var quiz = $scope.quiz;
			console.log($scope.currentPage);
			if($scope.currentPage > $scope.numPages){
				$scope.error = 'You have questions left unfilled between questions ' + $scope.numPages + ' and ' + $scope.currentPage;
			}
			else{
				$scope.error = false;
			}
			/*
			quiz.questions[$scope.currentPage-1] = {
				title: this.title,
				hint: 'sadasdasd',
				answer: this.answer,
				wrongAnswers: this.wrongAnswers
			};*/
			if ($scope.currentPage === $scope.numPages) {
				quiz.questions.push({
					title: '',
					hint: '',
					answer: [],
					wrongAnswers: []
				});
				$scope.numPages = quiz.questions.length;
			}
			else {
				//console.log('test');
				console.log($scope.numPages);
				console.log($scope.currentPage);

				//console.log(quiz.questions.length);
			}
			$scope.currentPage = $scope.currentPage + 1;
			quiz.$update(function () {
				$location.path('quizzes/' + quiz._id + '/edit');
			}, function (errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.formatNumber = function(){
			if( ($scope.currentPage > $scope.quiz.questions.length) || ($scope.currentPage < 1) ) {
				$scope.currentPage = $scope.quiz.questions.length;
			}
		};

		//$scope.setNumPages();
		//$scope.numPages = $scope.FindNumPages();
		//$scope.SetNumPages();
		/*
		$scope.$watch('$scope.quiz.questions.length', function(){
				$scope.SetNumPages();
			}
		);
		*/
		//$scope.numPages = $scope.quiz.questions.length;
		//$scope.numPages = $scope.quiz.questions.length;
		$scope.numPages = 1;
		$scope.currentPage = 1;
		$scope.maxSize = 10;

	}
]);
