'use strict';

module.exports = {
	app: {
		title: 'GroupQuiz',
		description: 'Play quizzes, manage quizzers',
		keywords: 'quiz, users, students, teachers, student, teacher, quizzer'
	},
	port: process.env.PORT || 80,
	templateEngine: 'swig',
	sessionSecret: 'MEAN',
	sessionCollection: 'sessions',
	assets: {
		lib: {
			css: [
				'public/lib/bootstrap/dist/css/bootstrap.css',
				'public/lib/bootstrap/dist/css/bootstrap-theme.css',
				'public/modules/quizzes/css/main.css',
				'http://fonts.googleapis.com/css?family=Roboto'/*
				'https://maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css',
				'https://maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap-theme.min.css'*/
			],
			js: [
				'public/lib/angular/angular.js',
				'public/lib/angular-resource/angular-resource.js', 
				'public/lib/angular-cookies/angular-cookies.js',
				'public/lib/angular-animate/angular-animate.js', 
				'public/lib/angular-touch/angular-touch.js', 
				'public/lib/angular-sanitize/angular-sanitize.js', 
				'public/lib/angular-ui-router/release/angular-ui-router.js',
				'public/lib/angular-ui-utils/ui-utils.js',
				'public/lib/angular-bootstrap/ui-bootstrap-tpls.js'/*,
				'http://ajax.googleapis.com/ajax/libs/angularjs/1.2.20/angular.min.js',
				'http://ajax.googleapis.com/ajax/libs/angularjs/1.2.20/angular-resource.min.js',
				'http://ajax.googleapis.com/ajax/libs/angularjs/1.2.20/angular-cookies.min.js',
				'http://ajax.googleapis.com/ajax/libs/angularjs/1.2.20/angular-animate.min.js',
				'http://ajax.googleapis.com/ajax/libs/angularjs/1.2.20/angular-touch.min.js',
				'http://ajax.googleapis.com/ajax/libs/angularjs/1.2.20/angular-sanitize.min.js',

				'http://cdn.jsdelivr.net/angular.ui-router/0.2.11/angular-ui-router.min.js',
				'http://cdn.bootcss.com/angular-ui-utils/0.1.1/angular-ui-utils.min.js',
				'http://libs.cncdn.cn/angular-ui-bootstrap/0.11.0/ui-bootstrap-tpls.min.js'*/
			]
		},
		css: [
			'public/modules/**/css/*.css'
		],
		js: [
			'public/config.js',
			'public/application.js',
			'public/modules/*/*.js',
			'public/modules/*/*[!tests]*/*.js',
			'public/modules/core/services/*.js',
			'public/modules/core/services/GoogleAnalytics.js'
		],
		tests: [
			'public/lib/angular-mocks/angular-mocks.js',
			'public/modules/*/tests/*.js'
		]
	}
};
