'use strict';

//Quizzes service used to communicate Quizzes REST endpoints
angular.module('quizzes').factory('Quizzes', ['$resource',
	function($resource) {
		return $resource('quizzes/:quizId', { quizId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);

function Question(){
	this.title = '';
	this.hint = '';
	this.answer = [];
	this.wrongAnswers = [];
}

angular.module('quizzes').factory('questionConstructor', [
	function() {
		return new Question();
	}
]);
