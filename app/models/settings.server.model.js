'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/** == Validation Functions */

/**
 * Settings Schema
 */
var SettingsSchema = new Schema({
	maxAttempts: {
		type: Number,
		default: 0
	},
	attemptsBeforeHint: {
		type: Number,
		default: 0
	},
	randomizeOrder: {
		type: Boolean,
		default: false
	}
});
/*
var SettingsSchema = mongoose.model('Settings', SettingsSchema);
*/
module.exports = SettingsSchema;
