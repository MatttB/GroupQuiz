/**
 * Created by Matt on 25/01/2015.
 */
'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    mongoose = require('mongoose'),
    errorHandler = require('../errors'),
    User = mongoose.model('User'),
    Quiz = mongoose.model('Quiz');
