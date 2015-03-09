/**
 * Created by Matt on 24/01/2015.
 */
'use strict';

module.exports = function(app) {//export the handlers.
    var users = require('../../app/controllers/users');//import other files for use.
    var quizzes = require('../../app/controllers/quizzes');
    var play = require('../../app/controllers/play');

    // Quizzes Routes
    app.route('/play')
        .get(quizzes.list);/*
        .post(users.requiresLogin, quizzes.create);*/


    app.route('/play/:quizId')
        .get(users.userByID, play.handleGetResponse)
        .post(users.userByID, play.handleData, play.respondToPost, play.updateDB);
    //check if logged in, work out actions, create session or return current session

};
