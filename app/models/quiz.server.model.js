'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Quiz Schema
 */
var QuizSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please enter a Quiz name',
		trim: true
	},
	created: {
		type: Date,
		default: Date.now
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	desc: {
		type: String,
		ref: 'desc'
	},
	questions: {
		type: Array,
		default: [],
		required: 'Please enter questions'
	}
});

mongoose.model('Quiz', QuizSchema);
