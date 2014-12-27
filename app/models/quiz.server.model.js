'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	SummarySchema = require('./summary.server.model'),
	QuestionsSchema = require('./summary.server.model.js'),
	SettingsSchema = require('./settings.server.model');
/** == Validation Functions */

var validateQuestions = function(questions){
	console.log(questions);
	console.log('validating questions...');
	if(questions[0].insert !== false){
		console.log('insert exists');
		return true;
	}
	var noErr = false;
	var i = -1;

	var inRange = function(value, low, high) {
		return !( (value > high) || (value < low) );
	};

	var validateImgurUrl = function(imgurUrl){//returns true if valid; false if invalid
		console.log(imgurUrl);
		if(imgurUrl !== ''){
			var pattern = /^https?:\/\/(i.)?imgur\.com\/[a-zA-Z0-9]{5,8}\.(?:jpe?g|gif|png)$/;
			/*
			 starts with http, 's' is optional, then must have '://', 'i.' is optional, must have 'imgur.com/',
			 then must have 5-8 alphanumeric characters in a row, then '.', then either 'jpg' (or 'jpeg'), 'gif', or 'png', and these must be at the end.
			 */
			return (pattern.test(imgurUrl));
		}
		else{
			return true;
		}
	};

	questions.some(function(question){//for each question
		i++;
		if(!question.title || !question.answer || !question.wrongAnswers){
			console.log('title, answer or wrongAnswers is falsy');
			return true;//title, answer or wrongAnswers is falsy
		}
		else if(question.title.length < 1 || question.title.length > 140 || question.answer.length < 1){
			console.log('title length err or answer array length err');
			return true;//either title has no length/too long or answer array has no length
		}
		else if( (!inRange(question.timeLimit, -1, 1000000)) || (!inRange(question.pointsAwarded, 1, 1000000)) || (!inRange(question.attemptsBeforeHint, -1, 1000000)) ){
			console.log('per-q settings now in range');
			return true;//per-question settings not in range
		}
		else if(!validateImgurUrl(question.questionImage)){
			console.log('question image not valid');
			return true;//question image invalid form
		}
		else{//so now we can iterate through the answer array's length as we know it has length...
			for(var a = 0; a < question.answer.length; a++){//check if each correct answer has length, less than 70chars
				if(!question.answer[a]){
					console.log('ansewr falsy');
					return true;//answer is falsy
				}
				else if(question.answer[a].length < 1 || question.answer[a].length > 70){
					console.log('individual answer length err');
					return true;
				}
			}
			for(var w = 0; w < question.wrongAnswers.length; w++){//check if each wrong answer has length, less than 70chars
				if(!question.wrongAnswers[w] && question.wrongAnswers[w] !== ''){
					console.log('wrong ansewr falsy');
					return true;////wrongAnswer was falsy
				}
				else if(question.wrongAnswers[w].length < 1 || question.wrongAnswers[w].length > 70){
					console.log('individual answer length err');
					return true;//wrongAnswer not between 1 and 70 chars
				}
			}
			if(i === questions.length-1){
				noErr = true;
			}
		}
	});
	console.log(noErr);
	return noErr;
};

/**
 * Quiz Schema
 */

var QuizSchema = new Schema({
	questions: {
		type: Array,
		default: [],
		ref: 'questions',
		validate: [validateQuestions, 'One or more of your questions is invalid']
	},
	summary: [SummarySchema],
	settings: [SettingsSchema]
});

mongoose.model('Quiz', QuizSchema);
