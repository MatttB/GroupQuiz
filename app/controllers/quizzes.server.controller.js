'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors'),
	Quiz = mongoose.model('Quiz'),
	_ = require('lodash');

/**
 * Create a Quiz
 */
exports.create = function(req, res) {
	var quiz = new Quiz(req.body);
	var summary = req.body.summary;
	summary.user = req.user;
	summary.displayName = req.user.displayName;
	quiz.summary = summary;
	quiz.questions = [{
		title: '',
		hint: '',
		answer: [''],
		wrongAnswers: [],
		insert: true
	}];

	quiz.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(quiz);
		}
	});
};

/**
 * Show the current Quiz
 */
exports.read = function(req, res) {
	res.jsonp(req.quiz);
};

/**
 * Update a Quiz
 */

exports.update = function(req, res) {
	var quiz = req.quiz;
	quiz = _.extend(quiz , req.body);
	quiz.questions[0].insert = false;

	quiz.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			delete quiz.questions[0].insert;
			res.jsonp(quiz);
		}
	});
};

/**
 * Delete an Quiz
 */
exports.delete = function(req, res) {
	var quiz = req.quiz ;

	quiz.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(quiz);
		}
	});
};

/**
 * List of Quizzes
 */
exports.list = function(req, res) { Quiz.find().sort('-created').populate('user', 'displayName').exec(function(err, quizzes) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(quizzes);
		}
	});
};

/**
 * Quiz middleware
 */
exports.quizByID = function(req, res, next, id) { Quiz.findById(id).populate('user', 'displayName').exec(function(err, quiz) {
		if (err) return next(err);
		if (! quiz) return next(new Error('Failed to load Quiz ' + id));
		req.quiz = quiz ;
		next();
	});
};

/**
 * Quiz authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.quiz.summary[0].user.toString() !== req.user._id.toString()) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
