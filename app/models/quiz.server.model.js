'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/** == Validation Functions */

/**
 *validateName function
 * @param name
 * @returns {boolean}
 */
var validateName = function(name){
	return name.length < 71 && name.length > 0;
};

/**
 *
 * @param desc
 * @returns {boolean}
 */
var validateDesc = function(desc){
	return desc.length < 141;
};

/**
 * Quiz Schema
 */
var QuizSchema = new Schema({
	name: {
		type: String,
		default: '',
		validate: [validateName, 'Quiz name must be between 1 and 70 characters'],
		ref: 'name',
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
		ref: 'desc',
		default: '',
		trim: true,
		validate: [validateDesc, 'Description can not be more than 140 characters']
	},
	questions: {
		type: Array,
		default: []
	},
	tags: {
		type: Array,
		default: []
	}
});

mongoose.model('Quiz', QuizSchema);
