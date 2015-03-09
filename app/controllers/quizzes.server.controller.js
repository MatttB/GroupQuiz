'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors'),
	Quiz = mongoose.model('Quiz'),
	User = mongoose.model('User'),
	_ = require('lodash');

/**
 * Create a Quiz
 */
exports.create = function(req, res) {//handling creation of a quiz
	var quiz = new Quiz(req.body);//initialise quiz using constructor
	console.log(req.body.summary);
	var summary = req.body.summary;
	summary.user = req.user;
	summary.displayName = req.user.displayName;
	quiz.summary = summary;
	quiz.settings = {randomizeOrder: false};//all initalisation^^^

	quiz.questions = [{//initalise first question
		questionId: mongoose.Types.ObjectId(),
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
		insert: true,//insert is true so that the database can handle it differently
		sortOptionsAlphabetically: false
	}];
	quiz.users = {};
	console.log(quiz);

	quiz.save(function(err) {//saves the quiz to the database
		if (err) {
			return res.status(400).send({//return HTTP ERROR STATUS 400 BAD REQUEST
				message: errorHandler.getErrorMessage(err)//ERROR HANDLING logs to server console
			});
		}
		else {
			res.jsonp(quiz);//respond with quiz via jsonp
		}
	});
};

/**
 * Show the current Quiz
 */
exports.read = function(req, res) {
	res.jsonp(req.quiz);//respond with quiz via jsonp
};

/**
 * Update a Quiz
 */

exports.update = function(req, res) {//updating thw quiz
	var quiz = req.quiz;
	quiz = _.extend(quiz , req.body);
	quiz.questions[0].insert = false;//used for
	quiz.questions.forEach(function(question){//loops through each question in questions array
		if(!question.questionId){//assigns a questionId if it does not exist (is falsey)
			question.questionId = mongoose.Types.ObjectId();
		}
	});
	quiz.summary[0].dateLastUpdated = Date.now();//generates a Unix Timestamp

	quiz.save(function(err) {//save the quiz to DB function
		if (err) {
			return res.status(400).send({//return HTTP ERROR STATUS 400 BAD REQUEST
				message: errorHandler.getErrorMessage(err)//ERROR HANDLING
			});
		}
		else {
			delete quiz.questions[0].insert;//delete the insert attribute  because it is being updated now and not the first creation
			res.jsonp(quiz);//respond with quiz via jsonp
		}
	});
};

/**
 * Delete a Quiz
 */
exports.delete = function(req, res) {//deleting a quiz
	var quiz = req.quiz;

	quiz.remove(function(err) {
		if (err) {
			return res.status(400).send({//return HTTP ERROR STATUS 400 BAD REQUEST
				message: errorHandler.getErrorMessage(err)//log error to console
			});
		}
		else {
			res.jsonp(quiz);//respond with quiz via jsonp
		}
	});

	//also update users
	console.log('deleting', req.quiz._id);
	var query = {'session.quizId': req.quiz._id.toString()},//setting up mongoose update parameters
		update = {$set: {session: false}},
		options = {multi:true};

	User.update(query, update, options, function(err){//callback function dealing with ERROR HANDLING to console
		console.log('ERR',err);
	});//update user.
};

/**
 * List Quizzes
 */
exports.list = function(req, res) { Quiz.find().sort('-created').populate('user', 'displayName').exec(function(err, quizzes) {//add user + displayName
		console.log('quizzes.list called');
	if (err) {
			return res.status(400).send({//return HTTP ERROR STATUS 400 BAD REQUEST
				message: errorHandler.getErrorMessage(err)//log error to console
			});
		}
	else {
			console.log('quizzes ended');
			res.jsonp(quizzes);//respond with quizzes array via jsonp
		}
	});
};

/**
 * Quiz middleware
 */
exports.quizByID = function(req, res, next, id) { Quiz.findById(id).populate('user', 'displayName').exec(function(err, quiz) {//get quiz by passed in id
		console.log('quiz by id');
		if (err) return next(err);//call next function passing error as a parameter.
		if (! quiz) return next(new Error('Failed to load Quiz ' + id));//respond with error via error constructor
		req.quiz = quiz;
		next();//call next function in middleware stack
	});
};

/**
 * Quiz authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.quiz.summary[0].user.toString() !== req.user._id.toString()) {//check if current user is has authorisation via comparing variables
		return res.status(403).send('User is not authorized');//respond with ERROR HTTP 403 FORBIDDEN
	}
	next();//call next function in middleware stack
};
