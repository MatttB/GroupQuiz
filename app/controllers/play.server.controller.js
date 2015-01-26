/**
 * Created by Matt on 24/01/2015.
 */
'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors'),
    Quiz = mongoose.model('Quiz'),
    _ = require('lodash');

/**

/**
 * Handling /play:id
 */

exports.createSummary = function(req, res, next){
    console.log('creating summary');
    req.quiz = {
        results: req.quiz.results,
        summary: req.quiz.summary
    };
    next();
};

exports.read = function(req, res) {
    console.log(req.quiz);
    res.jsonp(req.quiz);
};

exports.quizByID = function(req, res, next, id) { Quiz.findById(id).populate('user', 'displayName').exec(function(err, quiz) {
    console.log('quizByID: ' + id);
    if (err) return next(err);
    if (! quiz) return next(new Error('Failed to load Quiz ' + id));
    req.quiz = quiz;
    next();
});
};

exports.workOutAction = function(req, res, next){
    console.log('working out action../');
    var quiz = req.quiz;//working out based on quiz data from DB.
    var user = req.user;//using user data
    if(quiz.users[user._id]){//user exists
        console.log('user exists');
        if(quiz === 5){//no session but user exists
            console.log('no session but user exists');
            //insert session, start on question 1, res.currentQuestion = 5
        }
        else if(quiz === 5){//session in progress for user
            console.log('session in progress for user');

        }
    }
    else{//user does not exist, quiz.users.userId === undefined
        console.log('user does not exist in quiz, inserting user and session 1');
        //creating user and current quiz session in quiz
    }
    next();
};

exports.performAction = function(req, res){
    res.status(200).send('performing action');
};
