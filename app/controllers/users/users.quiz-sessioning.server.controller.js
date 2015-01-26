/**
 * Created by Matt on 25/01/2015.
 */
'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    mongoose = require('mongoose'),
    errorHandler = require('../errors'),
    User = mongoose.model('User'),
    Quiz = mongoose.model('Quiz');

var shuffleArray = function(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
};

exports.playQuiz = function(req, res){
    //either user.quizSession === false OR user.quizSession === req.quiz._id (quiz trying to be accessed)
    console.log('playQuiz func called');
    var user = req.user;
    if(!user.quizSession){//then create session for current quiz
        user.quizSession = {
            'quizId': req.quiz.summary[0]._id,
            'start': Date.now(),
            'end': undefined,
            'questions': [],
            'result': []
        };
        user.quizzes[req.quiz.summary[0]._id] = {nAttempts:0};
        user.quizzes[req.quiz.summary[0]._id].nAttempts ++;
        Quiz.findById(req.quiz.summary[0]._id).populate('user', 'displayName').exec(function(err, quiz) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            if (!quiz){
                return res.status(400).send({
                    message: 'failed to load quiz' + req.quiz.summary[0]._id
                });
            }
            var appendQuestionCallback = function(question){
                var newQuestion = {
                    'title': question.title,
                    'hint': question.hint,
                    'timeLimit': question.timeLimit,
                    'questionType': question.questionType
                };
                if(question.questionType === 'Multiple Choice'){
                    newQuestion.answers = shuffleArray(question.wrongAnswers.push(question.correctAnswer[0]));
                }
                user.quizSession.questions.push(newQuestion);
            };
            quiz.questions.forEach(appendQuestionCallback);
            user.quizSession.questions = shuffleArray(user.quizSession.questions);
            user.quizSession.nQuestions = user.quizSession.questions.length;
            User.update({'_id': user._id},{'quizSession':user.quizSession});
        });
    }
    res.jsonp('lol');
    res.redirect('/play/' + user.quizSession.quizId + '/quiz');
};
