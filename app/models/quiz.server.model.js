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

/**
 * Quiz Schema
 */
var QuizSchema = new Schema({
	summary: [SummarySchema],
	questions: {
		type: Array,
		default: []
	},
	settings: [SettingsSchema]
});

mongoose.model('Quiz', QuizSchema);
