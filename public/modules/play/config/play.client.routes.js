'use strict';

//Setting up route
angular.module('play').config(['$stateProvider',
	function($stateProvider) {
		// Quizzes state routing
		$stateProvider.
		state('listPlayedQuizzes', {
			url: '/play',
			templateUrl: 'modules/play/views/list-played-quizzes.client.view.html'
		}).
		state('playQuiz', {
			url: '/play/:quizId',
			templateUrl: 'modules/play/views/play-quiz.client.view.html'
		});
	}
]);
