'use strict';

angular.module('quizzes').controller('ModalInstanceCtrl', ['$scope', '$modalInstance', '$location',
	function ($scope, $modalInstance, $location) {

		$scope.ok = function () {//called on ok press
			$modalInstance.close();//close modal
		};

		$scope.cancel = function () {//called on cancel press
			$modalInstance.dismiss('cancel');//dismiss instance
		};

		$scope.remove = function( quiz ) {//take quiz and remove from quizzes list.
			if ( quiz ) { quiz.$remove();//DO HTTP DELETE

				for (var i in $scope.quizzes ) {//iterate through quizzes array.
					if ($scope.quizzes [i] === quiz ) {//if it's the correct quiz
						$scope.quizzes.splice(i, 1);//remove the quiz from array
					}
				}
			} else {
				$scope.quiz.$remove(function() {
					$location.path('quizzes');
					$scope.ok();//CLOSE
				});
			}
		};

	}
]);

// Quizzes controller
angular.module('quizzes').controller('QuizzesController', ['$scope', '$stateParams', '$location', '$sce', '$modal', 'Authentication', 'Quizzes',
	function($scope, $stateParams, $location, $sce, $modal, Authentication, Quizzes, Question) {
		$scope.authentication = Authentication;
		$scope.open = function (size) {

			var modalInstance = $modal.open({//initialise modal
				templateUrl: '/modules/quizzes/views/delete-modal.html',//using the template at this path
				controller: 'ModalInstanceCtrl',//using this angular controller
				scope: $scope,//defining this var for controller
				size: size,
				resolve: {
					quiz: function(){
						return $scope.quiz;
					}
				}
			});
		};


		// Create new Quiz
		$scope.create = function() {//create quiz
			// Create new Quiz object
			var quiz = new Quizzes ({//initailise quiz object via quizzes constructer.
				summary: {//initalise summary attribute via object literal.
					name: this.name,//initialise all these vars...
					desc: this.desc,
					quizImage: this.quizImage,
					quizVideo: this.quizVideo,
					youtubeEmbedUrl: this.youtubeEmbedUrl
				},
				questions: [{//initialise questions array
					'title': '',//with first element a definition of the first question via object literal.
					'hint': '',
					'attemptsBeforeHint': -1,
					'answer': [''],
					'ignoreCapitalisation': true,
					'wrongAnswers': [''],
					'timeLimit': 0,
					'pointsAwarded': 1,
					'questionType': 'Text Input',
					'questionImage': '',
					'multipleChoiceValidity': false
				}],
				settings: {},//initalise settings object
				users: {}//and users object
			});
/*

*/
			// Redirect after save
			quiz.$save(function(response) {//save via HTTP PUT
				$location.path('quizzes/' + response._id + '/edit');//redirect

				// Clear form fields
				$scope.name = '';//reset name
			}, function(errorResponse) {//ERROR HANDLING
				$scope.error = errorResponse.data.message;//BIND ERROR TO PAGE
			});
		};

		// Remove existing Quiz
		$scope.remove = function( quiz ) {//takes quiz as parameter
			if ( quiz ) { quiz.$remove();//do HTTP DELETE

				for (var i in $scope.quizzes ) {//iterate through quizzes
					if ($scope.quizzes [i] === quiz ) {//if current quiz
						$scope.quizzes.splice(i, 1);//remove the quiz from the array.
					}
				}
			} else {//otherwise
				$scope.quiz.$remove(function() {//remove the quiz HTTP DELETE.
					$location.path('quizzes');//redirect
				});
			}
		};

		// Find a list of Quizzes
		$scope.find = function() {//returns array.
			$scope.quizzes = Quizzes.query();//GET
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
			var quiz = $scope.quiz;//init
			quiz.questions[$scope.currentPage-1].answer.push('');//push answer to answer array.
		};

		$scope.delAnswer = function(){
			var quiz = $scope.quiz;//init
			quiz.questions[$scope.currentPage-1].answer.pop();//remove last answer
		};

		$scope.addWrongAnswer = function(){
			var quiz = $scope.quiz;//init
			quiz.questions[$scope.currentPage-1].wrongAnswers.push('');//push to wrong answers
			$scope.checkMultipleChoiceValidity();//check that question is valid
			//(number of wrong answers is a condition of validity)
		};

		$scope.delWrongAnswer = function(){//delete a wrong answer
			var quiz = $scope.quiz;//init
			quiz.questions[$scope.currentPage-1].wrongAnswers.pop();//remove last wrong answer
			$scope.checkMultipleChoiceValidity();
			//(number of wrong answers is a condition of validity)
		};

		$scope.delAnswerByIndex = function(index) {//delete answer from array by index passed in as parameter
			if ($scope.quiz.questions[$scope.currentPage -1].answer.length !== 1){//not 1 because can't be 0 answers
				$scope.quiz.questions[$scope.currentPage - 1].answer.splice(index, 1);//remove the question at the index.
			}
		};

		$scope.delWrongAnswerByIndex = function(index){//delete wrong answer from array by index passed in as parameter
			$scope.quiz.questions[$scope.currentPage-1].wrongAnswers.splice(index,1);//delete.
			$scope.checkMultipleChoiceValidity();//check if valid for multiple choice
			//(number of wrong answers is a condition of validity)
		};

		//Add Question

		$scope.addQuestion = function(){//add a question
			$scope.loading = true;
			$scope.quiz.questions.splice($scope.currentPage,0,{//insert to the current page plus one
				'title': '',//define the question via object literal.
				'hint': '',
				'attemptsBeforeHint': -1,
				'answer': [''],
				'ignoreCapitalisation': true,
				'wrongAnswers': [],
				'timeLimit': 0,
				'pointsAwarded': 1,
				'questionType': 'Text Input',
				'multipleChoiceValidity': false,
				'questionImage': ''
			});
			$scope.currentPage = $scope.currentPage + 1;//move the current page to the page of the question just defined.
			$scope.numPages = $scope.numPages + 1;//increment the total number of pages (we have just added a question..)
			$scope.update(false);//update with no check on whether it should update
		};

		$scope.delCurrentQuestion = function(){//delete the question on the current page
			if($scope.numPages === 1){//don't delete if there is only one question...
				return;
			}
			$scope.loading = true;//it is loading... it will need to do a DB update.
			$scope.numPages --;//decrement numPages by one.
			$scope.quiz.questions.splice($scope.currentPage-1,1);//remove the current question
			if($scope.currentPage !== 1){//if current page is not the first page
				$scope.currentPage --;//decrease page number by 1
			}
			$scope.update(false);//update with no check on whether it should update
		};



		// Update existing Quiz
		var quizComparator = [];
		$scope.check = true;
		$scope.noCheck = false;
		$scope.pattern = /^(i.)?imgur\.com\/[a-zA-Z0-9]{5,8}\.(?:jpe?g|gif|png)/;//regex checking for imgur url validity without protocol
		$scope.update = function(check) {
			$scope.loading = true;
			var quiz = $scope.quiz;
			var change;
			var checkChange = function (older, newer) {//check if there has been a change in the object by iterating through it
				if ($scope.error) {//if there's an error
					change = true;//should always attempt to  update if error
					return;
				}
				var changed = function (qnum) {//function that deals with what should happen if it has changed
					$scope.loading = true;
					$scope.error = 'Question ' + qnum + ' changed.';
					change = true;
				};
				if (older.length === 0) {
					change = true;
					return;
				}
				for (var i = 0; i < older.length; i++) {//for each question in older
					if ((older[i].title !== newer[i].title) || (older[i].hint !== newer[i].hint || older[i].ignoreCapitalisation !== newer[i].ignoreCapitalisation || older[i].questionImage !== newer[i].questionImage)) {
						changed(i + 1);//if any of title, hint, ignorecapitalisation or question image of changed...
						return;
					}
					else {//check answers
						if ((older[i].answer.length !== newer[i].answer.length) || (older[i].wrongAnswers.length !== newer[i].wrongAnswers.length)) {
							changed(i + 1);//checking length of array first because it's a cheap check.
							return;
						}
						for (var a = 0; a < older[i].answer.length; a++) {//length is the same, iterating through the actual answer values... more expensive.
							if (older[i].answer[a] !== newer[i].answer[a]) {
								changed(i + 1);
								return;
							}
						}
						for (var w = 0; w < older[i].wrongAnswers.length; w++) {//checking actual wrong answer values
							if (older[i].wrongAnswers[w] !== newer[i].wrongAnswers[w]) {
								changed(i + 1);
								return;
							}
						}
					}
				}
				$scope.loading = false;//loading is false if no change. won't get to this point if db update has happened.
				change = false;
			};
			if (check){//if it should be checked
				checkChange(quizComparator, quiz.questions);//then check if it has changed passing in the older and newer questions
			}
			else{
				change = true;
			}

			if($scope.pattern.test(quiz.summary[0].quizImage)){//if valid without protocol
				quiz.summary[0].quizImage = 'https://' + quiz.summary[0].quizImage;//add protocol
			}
			if(change) {//check if quiz has changed

				quizComparator = quiz.questions;

				quiz.$update(function () {//update db HTTP PUT
					$location.path('quizzes/' + quiz._id + '/edit');//redirect path to edit

					$scope.error = undefined;//no err
					$scope.loading = false;//not loading anymore
				}, function (errorResponse) {//callback after update
					$scope.error = errorResponse.data.message;//ERROR HANDLING if error assign error to page
					$scope.loading = false;//not loading.
				});
			}
		};

		$scope.updateNumPages = function() {//function updating the number of pages to the questions length
			$scope.numPages = $scope.quiz.questions.length;
		};

		$scope.setPage = function (pageNo) {//function settings the current page by parameter.
			$scope.currentPage = pageNo;
		};

		$scope.currentPage = 1;//initialising currentPage on page load

		$scope.gotoQuestion = function(index){//function moving page but also updating the number of pages.
			$scope.updateNumPages();
			$scope.currentPage = index;
		};

		$scope.changeTimeLimit = function(change){//icnrements the time limit by the change parameter
			var newValue = $scope.quiz.questions[$scope.currentPage-1].timeLimit + change;
			if(newValue < 0){
				$scope.quiz.questions[$scope.currentPage-1].timeLimit = 0;//if set to below 0, assign it to 0
			}
			else if(newValue > 1000000){
				$scope.quiz.questions[$scope.currentPage-1].timeLimit = 1000000;//if set to greater than 1m, set to 1m.
			}
			else{//otherwise assign to new value.
				$scope.quiz.questions[$scope.currentPage-1].timeLimit = newValue;
			}
		};

		$scope.changePointsAwarded = function(change){//same as changeTimeLimit but with 1 as lower boundary.
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

		$scope.changeAttemptsBeforeHint = function(change){//same as changeTimeLimit but with -1 as lower boundary.
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

		$scope.checkMultipleChoiceValidity = function(){//checks that current question is valid for multiple choice
			var valid = ($scope.quiz.questions[$scope.currentPage-1].wrongAnswers.length > 2);//assigned to expression. returns boolean.
			if(valid){
				$scope.quiz.questions[$scope.currentPage-1].multipleChoiceValidity = true;
			}
			else{
				$scope.quiz.questions[$scope.currentPage-1].multipleChoiceValidity = false;
				$scope.quiz.questions[$scope.currentPage-1].questionType = 'Text Input';//not valid so force question type to be text input.
			}
		};

		$scope.validVideoUrl = false;

		$scope.validImgurUrl = false;

		$scope.validateImgurUrl = function(imgurUrl){//assigns valid imgur url value to true/false for html to act upon
			//USES REGEX TO TEST
			var imgurPattern = /^(i.)?imgur\.com\/[a-zA-Z0-9]{5,8}\.(?:jpe?g|gif|png)/;
			if(imgurPattern.test(imgurUrl)){//if valid without protocol

				$scope.quiz.summary[0].quizImage = 'https://' + imgurUrl;//add protocol
				$scope.validImgurUrl = true;
				return $scope.quiz.summary[0].quizImage;
			}
			else{
				imgurPattern = /^https?:\/\/(i.)?imgur\.com\/[a-zA-Z0-9]{5,8}\.(?:jpe?g|gif|png)$/;
				if(imgurPattern.test(imgurUrl)){
					$scope.validImgurUrl = true;
					return imgurUrl;
				}
			}
			$scope.validImgurUrl = false;
			return 'http://';
		};

		$scope.validYoutubeUrl = false;

		$scope.validateYoutubeUrl = function(youtubeUrl){
			if(youtubeUrl.substring(0,4) !== 'http'){
				youtubeUrl = 'https://' + youtubeUrl;
			}
			var youtubePattern = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
			//https://www.youtube.com/watch?v=be-LbSaEzZQ&list=RDHCXXF0DFZWayA
			if(youtubePattern.test(youtubeUrl)){

				$scope.validYoutubeUrl = true;

				var matchInfo = youtubeUrl.match(youtubePattern);
				var indexOfVideoId = matchInfo[0].indexOf(matchInfo[1]);
				$scope.quiz.summary[0].youtubeEmbedUrl = 'https://www.youtube.com/embed/' + matchInfo[0].substring(indexOfVideoId,indexOfVideoId+11) + '?' + matchInfo[0].substring(indexOfVideoId+12);
				return $sce.trustAsResourceUrl($scope.quiz.summary[0].youtubeEmbedUrl);
			}
			else {
				$scope.validYoutubeUrl = false;
				return 'http://';
			}
		};

		$scope.selected = undefined;

		$scope.toggleSelected = function(){
			if($scope.selected === ''){
				$scope.selected = undefined;
			}
			else{
				$scope.selected = '';
			}

		};

		$scope.typeaheadCallback = function(){
			for(var i = 0; i < $scope.quiz.questions.length; i++){
				if($scope.quiz.questions[i].title === $scope.selected){
					$scope.currentPage = i + 1;
					break;
				}
			}
			$scope.update(true);
			$scope.selected = undefined;
		};

		$scope.validQuestionImgurUrl = false;

		$scope.validateQuestionImgurUrl = function(imgurUrl){
			var imgurPattern = /^(i.)?imgur\.com\/[a-zA-Z0-9]{5,8}\.(?:jpe?g|gif|png)/;
			if(imgurPattern.test(imgurUrl)){//if valid without protocol
				$scope.quiz.questions[$scope.currentPage-1].questionImage = 'https://' + imgurUrl;//add protocol
				$scope.validQuestionImgurUrl = true;
				return $scope.quiz.summary[0].quizImage;
			}
			else{
				imgurPattern = /^https?:\/\/(i.)?imgur\.com\/[a-zA-Z0-9]{5,8}\.(?:jpe?g|gif|png)$/;
				if(imgurPattern.test(imgurUrl)){

					$scope.validQuestionImgurUrl = true;
					return imgurUrl;
				}
			}
			$scope.validQuestionImgurUrl = false;
			return 'http://';
		};

		/** Settings tab functions / vars**/

		$scope.questionValues = {
			'timeLimit': 0,
			'pointsAwarded': 1,
			'attemptsBeforeHint': -1,
			'questionType': 'Text Input'
		};

		$scope.changeAllTimeLimits = function(change){
			var newValue = $scope.questionValues.timeLimit + change;
			if(newValue < 0){
				$scope.questionValues.timeLimit = 0;
			}
			else if(newValue > 1000000){
				$scope.questionValues.timeLimit = 1000000;
			}
			else{
				$scope.questionValues.timeLimit = newValue;
			}
		};

		$scope.changeAllPointsAwarded = function(change){
			var newValue = $scope.quiz.questions[$scope.currentPage-1].pointsAwarded + change;
			if(newValue < 1){
				$scope.questionValues.pointsAwarded = 1;
			}
			else if(newValue > 1000000){
				$scope.questionValues.pointsAwarded = 1000000;
			}
			else{
				$scope.questionValues.pointsAwarded = newValue;
			}
		};

		$scope.changeAllAttemptsBeforeHint = function(change){
			var newValue = $scope.questionValues.attemptsBeforeHint + change;
			if(newValue < -1){
				$scope.questionValues.attemptsBeforeHint = -1;
			}
			else if(newValue > 1000000){
				$scope.questionValues.attemptsBeforeHint = 1000000;
			}
			else{
				$scope.questionValues.attemptsBeforeHint = newValue;
			}
		};

		$scope.applyAllQuestionDataValues = function(){
			for(var i = 0; i < $scope.quiz.questions.length; i++){
				$scope.quiz.questions[i].timeLimit = $scope.questionValues.timeLimit;
				$scope.quiz.questions[i].pointsAwarded = $scope.questionValues.pointsAwarded;
				$scope.quiz.questions[i].attemptsBeforeHint = $scope.questionValues.attemptsBeforeHint;
				$scope.quiz.questions[i].sortOptionsAlphabetically = $scope.questionValues.sortOptionsAlphabetically;
			}
			$scope.update(false);
		};

		$scope.setAllQuestionTypes = function(qType){
			var i;//declare my iterator for my for loops
			if(qType === 'Text Input'){
				for(i = 0; i < $scope.quiz.questions.length; i++){
					$scope.quiz.questions[i].questionType = 'Text Input';
				}
				$scope.allQuestionsValuesError = false;
			}
			else if(qType === 'Multiple Choice'){
				var notQualified = [];
				for(i = 0; i < $scope.quiz.questions.length; i++){
					if($scope.quiz.questions[i].multipleChoiceValidity){
						$scope.quiz.questions[i].questionType = 'Multiple Choice';
					}
					else{
						$scope.quiz.questions[i].questionType = 'Text Input';
						notQualified.push((i+1).toString());
					}
				}
				if(notQualified !== []){
					//Build up error string of which ones do not qualify...
					if(notQualified.length > 2){
						var endString = ' and ' + notQualified.pop() + ' do not qualify for Multiple Choice.';
						var startString = 'Questions ';
						var midString = '';
						for(i = 0; i < notQualified.length - 1; i++){
							midString = midString + notQualified[i] + ', ';
						}
						midString = midString + notQualified.pop();
						$scope.allQuestionsValuesError = startString + midString + endString;
					}
					else if(notQualified.length === 2){
						$scope.allQuestionsValuesError = 'Questions ' + notQualified[0] + ' and ' + notQualified[1] + ' do not qualify for Multiple Choice';
					}
					else{
						$scope.allQuestionsValuesError = 'Question ' + notQualified[0] + ' does not qualify for Multiple Choice';
					}
				}
				else{
					$scope.allQuestionsValuesError = false;
				}
			}

		};

		//End settings tabs funcs/vars


	}
]);
