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
        .get(users.requiresLogin, play.workOutAction, play.performAction, play.respond)
        .post(play.moveToDone, play.respondToPost);
    //check if logged in, work out actions, create session or return current session

    // Finish by binding the Quiz middleware (get quiz)
    app.param('quizId', play.quizByID);
};
