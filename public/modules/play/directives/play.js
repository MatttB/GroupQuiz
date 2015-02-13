'use strict';

(function(){
    var app = angular.module('play-directives', ['ui.bootstrap']);

    app.directive('questionPlay', function() {
        return {
            restrict: 'E',
            templateUrl: '/modules/play/views/question-play.html'
        };
    });
})();
