'use strict';

//Play service used to communicate Play REST endpoints
angular.module('play').factory('Play', ['$resource',
    function($resource) {
        return $resource('play/:quizId', {quizId: '@_id'});
    }
]);
