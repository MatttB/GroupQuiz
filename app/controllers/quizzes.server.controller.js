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
	console.log(req.body.summary);
	var summary = req.body.summary;
	summary.user = req.user;
	summary.displayName = req.user.displayName;
	quiz.summary = summary;
	quiz.settings = {randomizeOrder: false};
	quiz.questions = [{
		title: '',
		hint: '',
		attemptsBeforeHint: -1,
		answer: [''],
		ignoreCapitalisation: true,
		wrongAnswers: [],
		timeLimit: 0,
		pointsAwarded: 1,
		questionType: 'Text Input',
		questionImage: '',
		multipleChoiceValidity: false,
		insert: true
	}];
	quiz.users = {'aUser':'lol'};
	console.log(quiz);

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
	quiz.questions.forEach(function(question){
		if(!question.questionId){
			question.questionId = mongoose.Types.ObjectId();
		}
	});

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
	console.log(quiz.settings);
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
		console.log('quizzes.list called');
	if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			console.log(quizzes);
			console.log('quizzes ended');
			res.jsonp(quizzes);
		}
	});
};

/**
 * Quiz middleware
 */
exports.quizByID = function(req, res, next, id) { Quiz.findById(id).populate('user', 'displayName').exec(function(err, quiz) {
		console.log('quiz by id');
		if (err) return next(err);
		if (! quiz) return next(new Error('Failed to load Quiz ' + id));
		req.quiz = quiz;
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
