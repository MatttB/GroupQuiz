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
			'wrongAnswers': []
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

		$scope.updateQuestion = function() {
			var quiz = $scope.quiz;
			console.log(quiz);

			var pushQuestion = function(){
				quiz.questions.push({
					'title': '',
					'hint': '',
					'answer': [''],
					'wrongAnswers': []
				});
			};

			var popQuestion = function(){
				quiz.questions.pop();
			};

			quiz.$update(function () {
				$location.path('quizzes/' + quiz._id + '/edit');
				pushQuestion();
				$scope.error = undefined;
				$scope.currentPage = $scope.currentPage + 1;
				$scope.numPages = $scope.numPages + 1;
				$scope.showDelAndPrev = true;
			},function(errorResponse) {
					console.log(errorResponse);
					if($scope.quiz.questions.length === 1){
						$scope.showDelAndPrev = false;
					}
					//popQuestion();
					$scope.error = errorResponse.data.message;
				}
			);
		};

		$scope.showDelAndPrev = false;

		$scope.delQuestion = function(){
			if($scope.currentPage === $scope.quiz.questions.length){
				$scope.currentPage --;
			}
			$scope.quiz.questions.splice($scope.currentPage - 1, 1);
			$scope.numPages --;
			//current page button visibility clean-up
			if($scope.quiz.questions.length === $scope.currentPage){
				$scope.showAdd = true;
				if($scope.currentPage === 1){
					$scope.showDelAndPrev = false;
				}
				else{
					$scope.showDelAndPrev = true;
				}
			}
			else{
				$scope.showAdd = false;
			}
		};

		$scope.nextQuestion = function() {
			console.log('next clicked');
			if ($scope.currentPage === $scope.quiz.questions.length) {
				$scope.updateQuestion();
			}
			else {
				$scope.currentPage++;
				$scope.showDelAndPrev = true;
			}
		};

		$scope.prevQuestion = function(){
			$scope.currentPage --;
		};

		/*
		console.log('@');
		console.log($scope.error);
		if(!$scope.error){
			if ($scope.currentPage === $scope.numPages) {
				quiz.questions.push({
					title: '',
					hint: '',
					answer: [],
					wrongAnswers: []
				});
				$scope.numPages = quiz.questions.length;
				$scope.currentPage = $scope.currentPage + n;
			}
			$scope.currentPage = $scope.currentPage + 1;
		}
*/
		$scope.formatNumber = function(){
			if( ($scope.currentPage > $scope.quiz.questions.length) || ($scope.currentPage < 1) ) {
				$scope.currentPage = $scope.quiz.questions.length;
			}
		};

		$scope.updateNumPages = function() {
			$scope.numPages = $scope.quiz.questions.length;
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
