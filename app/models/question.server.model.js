'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/** == Validation Functions */

var validateAnswer = function(answer){
	if(answer.length === 0){
		return false;
	}
	for(var i = 0; i < answer.length; i++){
		if(answer[i].length > 35 || answer[i].length === 0){
			return false;
		}
	}
	return true;
};

/**
 * Question Schema
 */
var QuestionSchema = new Schema({
	questionTitle: {
		type: String,
		default: '',
		required: 'Please enter a Question Title',
		max:70,
		trim: true
	},
	questionHint: {
		type: String,
		default: '',
		required: 'Please enter a Question Title',
		trim: true
	},
	answer: {
		type: Array,
		default: [],
		validate: [validateAnswer,'One or more of the correct answers are not between 0 and 35 characters']
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	tags: {
		type: Array,
		default: []
	}
});

mongoose.model('Question', QuestionSchema);
