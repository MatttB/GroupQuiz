'use strict';

//Quizzes service used to communicate Quizzes REST endpoints
angular.module('quizzes').factory('Quizzes', ['$resource',
	function($resource) {
		return $resource('quizzes/:quizId', { quizId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);


/* global moment: false *///lets jshint know that moment is a global variable so that it doesn't flag up errors...
angular.module('quizzes').filter('msToHuman', function(){
	var m, h, d, y;
	return function(input){
		if(input < 1000){
			return Math.floor(input).toString() + 'ms';
		}
		else if(input < 60000){
			//seconds.
			if(input < 10000){
				return moment.duration(input).asSeconds().toString().substr(0,3) + 's';
			}
			else{
				return moment.duration(input).asSeconds().toString().substr(0,4) + 's';
			}
		}
		else if(input < 3600000){
			//minutes:seconds
			m = moment.duration(input).minutes();
			return m.toString() + 'm' + moment.duration(input - (m*60000)).seconds().toString() + 's';
		}
		else if(input < 86400000){
			//hours:minutes
			h = moment.duration(input).hours();
			return h.toString() + 'h' + moment.duration(input - (h*3600000)).minutes().toString() + 'm';
		}
		else if(input < 2592000000){
			//days:hours
			d = moment.duration(input).days();
			return d.toString() + 'd' + moment.duration(input - (d*86400000)).hours().toString() + 'h';
		}
		else if(input < 31536000000){
			//months:days
			m = moment.duration(input).months();
			return m.toString() + 'm' + moment.duration(input - (m*2592000000)).days().toString() + 'd';
		}
		else{
			//years:months
			y = moment.duration(input).years();
			return y.toString() + 'y' + moment.duration(input - (y*31536000000)).months().toString() + 'm';
		}
	};
});

