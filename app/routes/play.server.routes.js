/**
 * Created by Matt on 24/01/2015.
 */
'use strict';

module.exports = function(app) {
    var users = require('../../app/controllers/users');
    var quizzes = require('../../app/controllers/quizzes');
    var play = require('../../app/controllers/play');

    // Quizzes Routes
    app.route('/play')
        .get(quizzes.list);/*
        .post(users.requiresLogin, quizzes.create);*/

    app.route('/play/:quizId')
        .get(users.requiresLogin, play.getQuiz, play.read);
        /**
        .put(users.requiresLogin, quizzes.hasAuthorization, quizzes.update)
        .delete(users.requiresLogin, quizzes.hasAuthorization, quizzes.delete);
         **/

    // Finish by binding the Quiz middleware
    app.param('quizId', play.quizByID);
};
