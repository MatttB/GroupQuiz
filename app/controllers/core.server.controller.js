'use strict';

/**
 * Module dependencies.
 */
var logger = require('./logger');
exports.index = function(req, res) {
	var ip = req.connection.remoteAddress;
	res.render('index', {
		user: req.user || null
	});
	logger.logip(ip);
};