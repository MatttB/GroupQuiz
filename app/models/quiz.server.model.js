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
	questions.some(function(question){
		i++;
		if(!question.title || !question.answer || !question.wrongAnswers){
			console.log('title, answer or wrongAnswers is falsy');
			return true;//title, answer or wrongAnswers is falsy
		}
		else if(question.title.length < 1 || question.title.length > 140 || question.answer.length < 1){
			console.log('title length err or answer array length err');
			return true;//either title has no length/too long or answer array has no length
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
