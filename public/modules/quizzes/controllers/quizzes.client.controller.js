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
					'attemptsBeforeHint': -1,
					'answer': [''],
					'ignoreCapitalisation': true,
					'wrongAnswers': [''],
					'timeLimit': 0,
					'pointsAwarded': 1,
					'questionType': 'Text Input',
					'multipleChoiceValidity': false
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
			$scope.checkMultipleChoiceValidity();
		};

		$scope.delWrongAnswer = function(){
			var quiz = $scope.quiz;
			quiz.questions[$scope.currentPage-1].wrongAnswers.pop();
			$scope.checkMultipleChoiceValidity();
		};

		$scope.delAnswerByIndex = function(index) {
			if ($scope.quiz.questions[$scope.currentPage -1].answer.length !== 1){
				$scope.quiz.questions[$scope.currentPage - 1].answer.splice(index, 1);
			}
		};

		$scope.delWrongAnswerByIndex = function(index){
			$scope.quiz.questions[$scope.currentPage-1].wrongAnswers.splice(index,1);
			$scope.checkMultipleChoiceValidity();
		};

		//Add Question

		$scope.addQuestion = function(){
			$scope.loading = true;
			$scope.quiz.questions.splice($scope.currentPage,0,{
				'title': '',
				'hint': '',
				'attemptsBeforeHint': -1,
				'answer': [''],
				'ignoreCapitalisation': true,
				'wrongAnswers': [],
				'timeLimit': 0,
				'pointsAwarded': 1,
				'questionType': 'Text Input',
				'multipleChoiceValidity': false
			});
			$scope.currentPage = $scope.currentPage + 1;
			$scope.numPages = $scope.numPages + 1;
			$scope.update(false);//update with no check on whether it should update
		};

		$scope.delCurrentQuestion = function(){
			if($scope.numPages === 1){
				return;
			}
			$scope.loading = true;
			$scope.numPages --;
			$scope.quiz.questions.splice($scope.currentPage-1,1);
			if($scope.currentPage !== 1){
				$scope.currentPage --;
			}
			$scope.update(false);//update with no check on whether it should update
		};

		// Update existing Quiz
		var quizComparator = [];
		$scope.check = true;
		$scope.noCheck = false;
		$scope.update = function(check) {
			$scope.loading = true;
			var quiz = $scope.quiz;
			var change;
			var checkChange = function (older, newer) {
				if ($scope.error) {
					change = true;
					return;
				}
				var changed = function (qnum) {
					$scope.loading = true;
					$scope.error = 'Question ' + qnum + ' changed.';
					change = true;
				};
				if (older.length === 0) {
					change = true;
					return;
				}
				console.log(older);
				for (var i = 0; i < older.length; i++) {//for each question in older
					if ((older[i].title !== newer[i].title) || (older[i].hint !== newer[i].hint || older[i].ignoreCapitalisation !== newer[i].ignoreCapitalisation)) {
						changed(i + 1);
						return;
					}
					else {//check answers
						if ((older[i].answer.length !== newer[i].answer.length) || (older[i].wrongAnswers.length !== newer[i].wrongAnswers.length)) {
							changed(i + 1);
							return;
						}
						for (var a = 0; a < older[i].answer.length; a++) {
							if (older[i].answer[a] !== newer[i].answer[a]) {
								changed(i + 1);
								return;
							}
						}
						for (var w = 0; w < older[i].wrongAnswers.length; w++) {
							if (older[i].wrongAnswers[w] !== newer[i].wrongAnswers[w]) {
								changed(i + 1);
								return;
							}
						}
					}
				}
				$scope.loading = false;
				change = false;
			};
			if (check){
				checkChange(quizComparator, quiz.questions);
			}
			else{
				change = true;
			}
			if(change) {//check if quiz has changed
				//console.log(JSON.parse(JSON.stringify(quiz)));
				//quizComparator = (JSON.parse(JSON.stringify(quiz)));//makes a copy of the quiz for checking if quiz has changed later
				quizComparator = quiz.questions;
				console.log('updating quiz...');
				quiz.$update(function () {
					$location.path('quizzes/' + quiz._id + '/edit');
					console.log(quizComparator);
					$scope.error = undefined;
					$scope.loading = false;
				}, function (errorResponse) {
					console.log(quiz.questions);
					$scope.error = errorResponse.data.message;
					$scope.loading = false;
				});
			}
		};

		$scope.updateNumPages = function() {
			$scope.numPages = $scope.quiz.questions.length;
		};

		$scope.setPage = function (pageNo) {
			$scope.currentPage = pageNo;
		};

		$scope.currentPage = 1;

		$scope.gotoQuestion = function(index){
			$scope.updateNumPages();
			$scope.currentPage = index;
		};

		$scope.changeNumValue = function(value, increment){
			value = value + increment;
		};

		$scope.changeTimeLimit = function(change){
			var newValue = $scope.quiz.questions[$scope.currentPage-1].timeLimit + change;
			if(newValue < 0){
				$scope.quiz.questions[$scope.currentPage-1].timeLimit = 0;
			}
			else if(newValue > 1000000){
				$scope.quiz.questions[$scope.currentPage-1].timeLimit = 1000000;
			}
			else{
				$scope.quiz.questions[$scope.currentPage-1].timeLimit = newValue;
			}
		};

		$scope.changePointsAwarded = function(change){
			var newValue = $scope.quiz.questions[$scope.currentPage-1].pointsAwarded + change;
			if(newValue < 1){
				$scope.quiz.questions[$scope.currentPage-1].pointsAwarded = 1;
			}
			else if(newValue > 1000000){
				$scope.quiz.questions[$scope.currentPage-1].pointsAwarded = 1000000;
			}
			else{
				$scope.quiz.questions[$scope.currentPage-1].pointsAwarded = newValue;
			}
		};

		$scope.changeAttemptsBeforeHint = function(change){
			var newValue = $scope.quiz.questions[$scope.currentPage-1].attemptsBeforeHint + change;
			if(newValue < -1){
				$scope.quiz.questions[$scope.currentPage-1].attemptsBeforeHint = -1;
			}
			else if(newValue > 1000000){
				$scope.quiz.questions[$scope.currentPage-1].attemptsBeforeHint = 1000000;
			}
			else{
				$scope.quiz.questions[$scope.currentPage-1].attemptsBeforeHint = newValue;
			}
		};

		$scope.checkMultipleChoiceValidity = function(){
			var valid = ($scope.quiz.questions[$scope.currentPage-1].wrongAnswers.length > 2);
			if(valid){
				$scope.quiz.questions[$scope.currentPage-1].multipleChoiceValidity = true;
			}
			else{
				$scope.quiz.questions[$scope.currentPage-1].multipleChoiceValidity = false;
				$scope.quiz.questions[$scope.currentPage-1].questionType = 'Text Input';
			}
		};

		$scope.setActive = function(val) {
			$scope.checkMultipleChoiceValidity();
			if(val === 'Multiple Choice' && !$scope.quiz.questions[$scope.currentPage-1].multipleChoiceValidity){
				return;
			}
			else{
				$scope.quiz.questions[$scope.currentPage-1].questionType = val;
			}
		};

	}
]);
