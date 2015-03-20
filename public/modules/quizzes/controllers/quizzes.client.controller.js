//To understand recursion, see the bottom of this file #COMP3Revision
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
		$scope.noCheck = false;//here be dragons, prepare yourself
		$scope.pattern = /^(i.)?imgur\.com\/[a-zA-Z0-9]{5,8}\.(?:jpe?g|gif|png)/;//regex checking for imgur url validity without protocol
		$scope.update = function(check) {/* This is O(scary), but seems quick enough in practice. */
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
				if (older.length === 0) {// If this comment is removed the program will blow up
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

				quizComparator = quiz.questions;/////////////////////////////////////// this is a well commented line

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
			if(imgurPattern.test(imgurUrl)){//if valid without protocol -- returns true/false

				$scope.quiz.summary[0].quizImage = 'https://' + imgurUrl;//add protocol
				$scope.validImgurUrl = true;//assign true for view to show preview
				return $scope.quiz.summary[0].quizImage;//return url to view.
			}
			else{
				imgurPattern = /^https?:\/\/(i.)?imgur\.com\/[a-zA-Z0-9]{5,8}\.(?:jpe?g|gif|png)$/;//not test with the http protocol
				if(imgurPattern.test(imgurUrl)){//returns true/false
					$scope.validImgurUrl = true;//assign true for view to show preview
					return imgurUrl;//return url to view
				}
			}
			$scope.validImgurUrl = false;//url is not valid. will have returned by now if it is valid.
			return 'http://';//return just the protocol.
		};

		$scope.validYoutubeUrl = false;

		$scope.validateYoutubeUrl = function(youtubeUrl){
			if(youtubeUrl.substring(0,4) !== 'http'){//check if starts with http. easy inexpensive check before expensive regexes.
				youtubeUrl = 'https://' + youtubeUrl;//add protocol if http does not prepend domain
			}
			var youtubePattern = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
			if(youtubePattern.test(youtubeUrl)){//returns true/false

				$scope.validYoutubeUrl = true;//used to show live preview.

				var matchInfo = youtubeUrl.match(youtubePattern);//object of info about the match.
				var indexOfVideoId = matchInfo[0].indexOf(matchInfo[1]);//storing video id.
				//making the URL an embeddable URL, regardless of whether the original link was embeddable:
				$scope.quiz.summary[0].youtubeEmbedUrl = 'https://www.youtube.com/embed/' + matchInfo[0].substring(indexOfVideoId,indexOfVideoId+11) + '?' + matchInfo[0].substring(indexOfVideoId+12);
				return $sce.trustAsResourceUrl($scope.quiz.summary[0].youtubeEmbedUrl);//allow the user-submitted URL to be inserted into the view. must be a youtube URL because it was tested against the regex.
			}
			else {
				$scope.validYoutubeUrl = false;//do not show live preview
				return 'http://';//return non full url
			}
		};

		$scope.selected = undefined;//initialise for search

		$scope.toggleSelected = function(){//toggles like a boolean
			if($scope.selected === ''){
				$scope.selected = undefined;
			}
			else{
				$scope.selected = '';
			}

		};

		$scope.typeaheadCallback = function(){//function called on event of a click of the popup.
			for(var i = 0; i < $scope.quiz.questions.length; i++){//iterate through each question
				if($scope.quiz.questions[i].title === $scope.selected){//if title is the selected one.
					$scope.currentPage = i + 1;//move page to the question page of the title clicked on.
					break;//no need to iterate anymore, question found.
				}
			}
			$scope.update(true);//update the quiz with a check on whether to update or not.
			$scope.selected = undefined;//toggle off.
		};

		$scope.validQuestionImgurUrl = false;//initialise preview at false.

		$scope.validateQuestionImgurUrl = function(imgurUrl){
			var imgurPattern = /^(i.)?imgur\.com\/[a-zA-Z0-9]{5,8}\.(?:jpe?g|gif|png)/;//REGULAR EXPRESSION without protocol
			if(imgurPattern.test(imgurUrl)){//if valid without protocol
				$scope.quiz.questions[$scope.currentPage-1].questionImage = 'https://' + imgurUrl;//add protocol
				$scope.validQuestionImgurUrl = true;//show preview
				return $scope.quiz.summary[0].quizImage;//return url to the view.
			}
			else{//smoke weed everyday
				imgurPattern = /^https?:\/\/(i.)?imgur\.com\/[a-zA-Z0-9]{5,8}\.(?:jpe?g|gif|png)$/;//REGULAR EXPRESSION with protocol
				if(imgurPattern.test(imgurUrl)){//if valid with protocol

					$scope.validQuestionImgurUrl = true;//show preview
					return imgurUrl;//return url to the view.
				}
			}
			$scope.validQuestionImgurUrl = false;//won't get this far if not valid, do not show preview
			return 'http://';//return http.
		};

		/** Settings tab functions / vars**/

		$scope.questionValues = {//initialise questionValues for settings tab
			'timeLimit': 0,
			'pointsAwarded': 1,
			'attemptsBeforeHint': -1,
			'questionType': 'Text Input'
		};

		/**
		 * For the brave souls who get this far: You are the chosen ones,
		 * the valiant knights of programming who toil away, without rest,
		 * fixing our most awful code. To you, true saviors, kings of men,
		 * I say this: never gonna give you up, never gonna let you down,
		 * never gonna run around and desert you. Never gonna make you cry,
		 * never gonna say goodbye. Never gonna tell a lie and hurt you.
		 */

		//In all seriousness
		//I salute you, if you are dedicated enough to read through all of my code.
		//And for what? £7 per project?
		//Good job.

		$scope.changeAllTimeLimits = function(change){//change the time limit on settings page.
			var newValue = $scope.questionValues.timeLimit + change;//increment time limit by change parameter and assign to newValue
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

		$scope.changeAllPointsAwarded = function(change){//change the points awarded on settings page.
			var newValue = $scope.quiz.questions[$scope.currentPage-1].pointsAwarded + change;//increment pointsAwarded by change parameter and assign to newValue
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

		$scope.changeAllAttemptsBeforeHint = function(change){//change the attempts before hint on settings page.
			var newValue = $scope.questionValues.attemptsBeforeHint + change;//increment attempts before hint by change parameter and assign to newValue
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

		$scope.applyAllQuestionDataValues = function(){//apply values for every question.
			for(var i = 0; i < $scope.quiz.questions.length; i++){//iterate through each question
				$scope.quiz.questions[i].timeLimit = $scope.questionValues.timeLimit;//and assign all 4 of the attributes...
				$scope.quiz.questions[i].pointsAwarded = $scope.questionValues.pointsAwarded;
				$scope.quiz.questions[i].attemptsBeforeHint = $scope.questionValues.attemptsBeforeHint;
				$scope.quiz.questions[i].sortOptionsAlphabetically = $scope.questionValues.sortOptionsAlphabetically;
			}
			$scope.update(false);//update without a check. has been a change.
		};

		$scope.setAllQuestionTypes = function(qType){//set question type for each question if I can, by qtype passed in
			var i;//declare my iterator for my for loops
			if(qType === 'Text Input'){//set all to text input
				for(i = 0; i < $scope.quiz.questions.length; i++){//iterate through each question
					$scope.quiz.questions[i].questionType = 'Text Input';//assigning qtype to text input...
				}
				$scope.allQuestionsValuesError = false;//no errors because every question can qualify for text input.
			}
			else if(qType === 'Multiple Choice'){//set question type  to text input, checking if qualifies
				var notQualified = [];//initialise array of not qualified questions
				for(i = 0; i < $scope.quiz.questions.length; i++){//iterate through questions
					if($scope.quiz.questions[i].multipleChoiceValidity){//if valid
						$scope.quiz.questions[i].questionType = 'Multiple Choice';//set to multiple choice
					}
					else{//else set to text input
						$scope.quiz.questions[i].questionType = 'Text Input';
						notQualified.push((i+1).toString());//push to notqualified array
					}
				}
				if(notQualified !== []){//if there are q's that do not qualify based on length of array
					//Build up error string of which ones do not qualify...
					if(notQualified.length > 2){
						var endString = ' and ' + notQualified.pop() + ' do not qualify for Multiple Choice.';
						var startString = 'Questions ';
						var midString = '';
						for(i = 0; i < notQualified.length - 1; i++){//iterate through questions
							midString = midString + notQualified[i] + ', ';//adding the number plus a comma and a space for all the questions that aren't the last one...
						}
						midString = midString + notQualified.pop();//add last question number to the mid string
						$scope.allQuestionsValuesError = startString + midString + endString;//add all the strings!
					}
					else if(notQualified.length === 2){//only 2 so it's just questions x and y.
						$scope.allQuestionsValuesError = 'Questions ' + notQualified[0] + ' and ' + notQualified[1] + ' do not qualify for Multiple Choice';
					}
					else{//just one question: question x.
						$scope.allQuestionsValuesError = 'Question ' + notQualified[0] + ' does not qualify for Multiple Choice';
					}
				}
				else{// This comment is self explanatory.
					$scope.allQuestionsValuesError = false;//else no errors
				}
			}

		};

		//End settings tabs funcs/vars


	}
]);
//To understand recursion, see the top of this file #COMP3Revision
