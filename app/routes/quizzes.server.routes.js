'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users');
	var quizzes = require('../../app/controllers/quizzes');

	// Quizzes Routes
	app.route('/quizzes')
		.get(quizzes.list)
		.post(users.requiresLogin, quizzes.create);

	app.route('/quizzes/:quizId')
		.get(quizzes.read)
		.put(users.requiresLogin, quizzes.hasAuthorization, quizzes.update)
		.delete(users.requiresLogin, quizzes.hasAuthorization, quizzes.delete);

	// Finish by binding the Quiz middleware
	app.param('quizId', quizzes.quizByID);
};