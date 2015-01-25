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

exports.getQuiz = function(req, res, id, next) {
    Quiz.find({'_id':id});
    next();
};

exports.read = function(req, res) {
    res.jsonp(req.quiz);
};

exports.quizByID = function(req, res, next, id) { Quiz.findById(id).populate('user', 'displayName').exec(function(err, quiz) {
    if (err) return next(err);
    if (! quiz) return next(new Error('Failed to load Quiz ' + id));
    req.quiz = quiz;
    next();
});
};
