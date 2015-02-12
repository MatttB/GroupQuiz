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
 *
 * @param imgurUrl
 * @returns {boolean}
 */
var validateImgurUrl = function(imgurUrl){
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

var validateYoutubeUrl = function(youtubeUrl){
	console.log(youtubeUrl);
	if(youtubeUrl !== ''){
		var p = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
		return (youtubeUrl.match(p)) ? true : false;
	}
	else{
		return true;
	}
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
	quizImage: {
		type: String,
		default: '',
		validate: [validateImgurUrl, 'The image link provided is not a valid imgur.com link'],
		ref: 'imgurUrl',
		trim: true
	},
	quizVideo: {
		type: String,
		default: '',
		validate: [validateYoutubeUrl, 'The video link provided is not a valid Youtube link'],
		ref: 'youtubeUrl',
		trim: true
	},
	youtubeEmbedUrl: {
		type: String,
		default: '',
		trim: true
	},
	tags: {
		type: Array,
		default: []
	},
	dateLastUpdated: {
		type: Number,
		default: Date.now()
	}
});

/**
var QuestionsSchema = mongoose.model('Summary', SummarySchema);
**/
module.exports = SummarySchema;
