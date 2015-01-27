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
            req.action = 'createSessionInUser';
            console.log('no session but user exists');
            //insert session, start on question 1, res.currentQuestion = 5
        }
        else if(quiz === 5){//session in progress for user
            req.action = 'returnCurrentQuestion';
            console.log('session in progress for user');

        }
    }
    else{//user does not exist, quiz.users.userId === undefined
        req.action = 'createUserAndSession';
        console.log('user does not exist in quiz, inserting user and session 1');
        //creating user and current quiz session in quiz
    }
    next();
};

exports.performAction = function(req, res){
    var quiz = req.quiz;
    var newSession = function(){//constructor function, though using object literal as it does not contain methods
        //uses req.quiz
        var shuffleArray = function(array) {//shuffle array using implementation of Fisher-Yates' Knuth Shuffle
            for (var i = array.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var temp = array[i];
                array[i] = array[j];
                array[j] = temp;
            }
            return array;
        };
        var appendQuestionCallback = function(question){
            var newQuestion = {//new question definition by object literal
                'title': question.title,
                'timeLimit': question.timeLimit,
                'questionType': question.questionType,
                'pointsAwarded': question.pointsAwarded
            };
            if(question.questionType === 'Multiple Choice'){
                newQuestion.answers = shuffleArray(question.wrongAnswers.push(question.correctAnswer[0]));//shuffle answer order so they can't just remember "it's the first answer"
            }
            questions.push(newQuestion);
        };

        //creating questions:
        var questions = [];
        quiz.questions.forEach(appendQuestionCallback);
        if(quiz.settings.randomizeOrder){
            questions = shuffleArray(questions);
        }

        return {
            dateStarted: Date.now(),
            questions: questions,
            doneQuestions: []
        };
    };
    console.log(newSession());

    var extractUserInfo = function(){
        return{
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            email: req.user.email,
            username: req.user.username,
            displayName: req.user.displayName
        };
    };


    if(req.action === 'createUserAndSession'){
        //TODO
        console.log('creating user and session in quiz');
        console.log(req.user);
        console.log(req);
        var user = {
            session: newSession(),
            completedQuizSessions: [],//to be appended to later at the end of the session (on last question),
            info: extractUserInfo()
        };
        //now update quiz collection
        var conditions = {'_id':req.quiz._id};
        var update = {$set: {}};
        update.$set['users.' + req.user._id] = user;
        console.log(conditions,update);
        var callback = function(err, doc){
            if(err){
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
        };
        Quiz.update(conditions, update, {}, callback);

    }
    else if(req.action === 'createSessionInUser'){
        //TODO
        console.log('creating session in user (in quiz)');
    }
    else{//return current question
        //TODO
        console.log('returning current question');
    }
};
