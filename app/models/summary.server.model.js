'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Validation Functions
 */
/**
 *validateName function
 * @param name
 * @returns {boolean}
 */
var validateName = function(name){
	return( (name.length > 0) && (name.length < 71) );
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
 * Questions Schema
 */
var SummarySchema = new Schema({
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
		type: Schema.ObjectId
	},
	displayName: {
		type: String
	},
	desc: {
		type: String,
		default: '',
		validate: [validateDesc, 'Description can not be more than 140 characters'],
		ref: 'desc',
		trim: true
	},
	tags: {
		type: Array,
		default: []
	}
});

var QuestionsSchema = mongoose.model('Summary', SummarySchema);

module.exports = SummarySchema;
