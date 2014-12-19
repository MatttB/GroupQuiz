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

		$scope.delAnswerByIndex = function(index) {
			if ($scope.quiz.questions[$scope.currentPage -1].answer.length !== 1){
				$scope.quiz.questions[$scope.currentPage - 1].answer.splice(index, 1);
			}
		};

		$scope.delWrongAnswerByIndex = function(index){
			$scope.quiz.questions[$scope.currentPage-1].wrongAnswers.splice(index,1);
		};

		// Update existing Quiz
		var quizComparator = [];
		$scope.update = function() {
			var quiz = $scope.quiz;
			var change;

			var checkChange = function(older, newer){
				if($scope.error){
					change = true;
					return;
				}
				var changed = function(qnum){
					$scope.error = 'Question ' + qnum + ' changed.';
					change = true;
				};
				if(older.length === 0){
					change = true;
					return;
				}
				console.log(older);
				for(var i = 0; i < older.length; i++){//for each in older
					if( (older[i].title !== newer[i].title) || (older[i].hint !== newer[i].hint) ){
						changed(i+1);
						return;
					}
					else{//check answers
						if( (older[i].answer.length !== newer[i].answer.length) || (older[i].wrongAnswers.length !== newer[i].wrongAnswers.length) ){
							changed(i+1);
							return;
						}
						for(var a = 0; a < older[i].answer.length; a++){
							if(older[i].answer[a] !== newer[i].answer[a]){
								changed(i+1);
								return;
							}
						}
						for(var w = 0; w < older[i].wrongAnswers.length; w++){
							if(older[i].wrongAnswers[w] !== newer[i].wrongAnswers[w]){
								changed(i+1);
								return;
							}
						}
					}
				}
				change = false;
			};
			checkChange(quizComparator, quiz.questions);
			if(change) {//check if quiz has changed
				//console.log(JSON.parse(JSON.stringify(quiz)));
				//quizComparator = (JSON.parse(JSON.stringify(quiz)));//makes a copy of the quiz for checking if quiz has changed later
				quizComparator = quiz.questions;
				console.log('updating quiz...');
				quiz.$update(function () {
					$location.path('quizzes/' + quiz._id + '/edit');
					console.log(quizComparator);
					$scope.error = undefined;
				}, function (errorResponse) {
					console.log(quiz.questions);
					$scope.error = errorResponse.data.message;
				});
			}
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

			quiz.$update(function () {

				$location.path('quizzes/' + quiz._id + '/edit');
				pushQuestion();
				$scope.error = undefined;
				$scope.currentPage++;
				$scope.numPages++;
			},function(errorResponse) {
					console.log(errorResponse);
					//popQuestion();
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

		$scope.updateNumPages = function() {
			$scope.numPages = $scope.quiz.questions.length;
		};

		$scope.setPage = function (pageNo) {
			$scope.currentPage = pageNo;
		};

		$scope.currentPage = 1;


	}
]);
