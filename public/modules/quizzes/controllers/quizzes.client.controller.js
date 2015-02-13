'use strict';

angular.module('quizzes').controller('ModalInstanceCtrl', ['$scope', '$modalInstance', '$location',
	function ($scope, $modalInstance, $location) {

		$scope.ok = function () {
			$modalInstance.close();
		};

		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};

		$scope.remove = function( quiz ) {
			console.log('remove called');
			console.log(quiz);
			if ( quiz ) { quiz.$remove();

				for (var i in $scope.quizzes ) {
					if ($scope.quizzes [i] === quiz ) {
						$scope.quizzes.splice(i, 1);
					}
				}
			} else {
				$scope.quiz.$remove(function() {
					$location.path('quizzes');
					$scope.ok();
				});
			}
		};

	}
]);

// Quizzes controller
angular.module('quizzes').controller('QuizzesController', ['$scope', '$stateParams', '$location', '$sce', '$modal', 'Authentication', 'Quizzes',
	function($scope, $stateParams, $location, $sce, $modal, Authentication, Quizzes, Question) {
		$scope.authentication = Authentication;
		console.log($modal);
		console.log($location);
		$scope.open = function (size) {

			var modalInstance = $modal.open({
				templateUrl: '/modules/quizzes/views/delete-modal.html',
				controller: 'ModalInstanceCtrl',
				scope: $scope,
				size: size,
				resolve: {
					quiz: function(){
						return $scope.quiz;
					}
				}
			});
		};


		// Create new Quiz
		$scope.create = function() {
			// Create new Quiz object
			var quiz = new Quizzes ({
				summary: {
					name: this.name,
					desc: this.desc,
					quizImage: this.quizImage,
					quizVideo: this.quizVideo,
					youtubeEmbedUrl: this.youtubeEmbedUrl
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
					'questionImage': '',
					'multipleChoiceValidity': false
				}],
				settings: {},
				users: {}
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
				'multipleChoiceValidity': false,
				'questionImage': ''
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
		$scope.pattern = /^(i.)?imgur\.com\/[a-zA-Z0-9]{5,8}\.(?:jpe?g|gif|png)/;//regex checking for validity without protocol
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
					if ((older[i].title !== newer[i].title) || (older[i].hint !== newer[i].hint || older[i].ignoreCapitalisation !== newer[i].ignoreCapitalisation || older[i].questionImage !== newer[i].questionImage)) {
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

			if($scope.pattern.test(quiz.summary[0].quizImage)){//if valid without protocol
				quiz.summary[0].quizImage = 'https://' + quiz.summary[0].quizImage;//add protocol
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

		$scope.validVideoUrl = false;

		$scope.validImgurUrl = false;

		$scope.validateImgurUrl = function(imgurUrl){
			console.log('image validation:..');
			var imgurPattern = /^(i.)?imgur\.com\/[a-zA-Z0-9]{5,8}\.(?:jpe?g|gif|png)/;
			if(imgurPattern.test(imgurUrl)){//if valid without protocol
				console.log('valid without protocol');
				$scope.quiz.summary[0].quizImage = 'https://' + imgurUrl;//add protocol
				$scope.validImgurUrl = true;
				return $scope.quiz.summary[0].quizImage;
			}
			else{
				imgurPattern = /^https?:\/\/(i.)?imgur\.com\/[a-zA-Z0-9]{5,8}\.(?:jpe?g|gif|png)$/;
				if(imgurPattern.test(imgurUrl)){
					console.log('valid WITH protocol');
					console.log(imgurUrl);
					$scope.validImgurUrl = true;
					return imgurUrl;
				}
			}
			$scope.validImgurUrl = false;
			return 'http://';
		};

		$scope.validYoutubeUrl = false;

		$scope.validateYoutubeUrl = function(youtubeUrl){
			console.log('yt validation:..');
			if(youtubeUrl.substring(0,4) !== 'http'){
				youtubeUrl = 'https://' + youtubeUrl;
			}
			var youtubePattern = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
			//https://www.youtube.com/watch?v=be-LbSaEzZQ&list=RDHCXXF0DFZWayA
			if(youtubePattern.test(youtubeUrl)){
				console.log('YT valid WITH protocol');
				console.log(youtubeUrl);
				$scope.validYoutubeUrl = true;
				console.log(youtubeUrl.match(youtubePattern));
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
			console.log('called');
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
			console.log('question image validation:..');
			var imgurPattern = /^(i.)?imgur\.com\/[a-zA-Z0-9]{5,8}\.(?:jpe?g|gif|png)/;
			if(imgurPattern.test(imgurUrl)){//if valid without protocol
				console.log('valid without protocol');
				$scope.quiz.questions[$scope.currentPage-1].questionImage = 'https://' + imgurUrl;//add protocol
				$scope.validQuestionImgurUrl = true;
				return $scope.quiz.summary[0].quizImage;
			}
			else{
				imgurPattern = /^https?:\/\/(i.)?imgur\.com\/[a-zA-Z0-9]{5,8}\.(?:jpe?g|gif|png)$/;
				if(imgurPattern.test(imgurUrl)){
					console.log('valid WITH protocol');
					console.log(imgurUrl);
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
			}
			$scope.update(false);
		};

		$scope.setAllQuestionTypes = function(qType){
			console.log('setAllQTypes func called');
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
						console.log('Should be multiple choice');
						$scope.quiz.questions[i].questionType = 'Multiple Choice';
					}
					else{
						console.log('Should be text input');
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
				console.log('ALl Questions Values Error:');
				console.log($scope.allQuestionsValuesError);
			}

		};

		//End settings tabs funcs/vars


	}
]);
