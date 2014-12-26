'use strict';

(function(){
    var app = angular.module('quiz-directives', ['ui.bootstrap']);

    app.directive('summary', function() {
        return {
            restrict: 'E',
            templateUrl: '/modules/quizzes/views/summary.html'
        };
    });

    app.directive('settings', function() {
        return {
            restrict: 'E',
            templateUrl: '/modules/quizzes/views/settings.html'
        };
    });

    app.directive('questions', function() {
        return {
            restrict: 'E',
            templateUrl: '/modules/quizzes/views/questions.html'
        };
    });

    app.directive('question', function() {
        return {
            restrict: 'E',
            templateUrl: '/modules/quizzes/views/question.html'
        };
    });

    app.directive('questionSettings', function() {
        return {
            restrict: 'E',
            templateUrl: '/modules/quizzes/views/question-settings.html'
        };
    });

    app.directive('correctAnswers', function(){
        return{
            restrict: 'E',
            templateUrl: '/modules/quizzes/views/correct-answers.html'
        };
    });

    app.directive('incorrectAnswers', function(){
        return{
            restrict: 'E',
            templateUrl: '/modules/quizzes/views/incorrect-answers.html'
        };
    });

    app.directive('quizTabs', function() {
        return {
            restrict: 'E',
            templateUrl: '/modules/quizzes/views/quiz-tabs.html',
            controller: function() {
                this.tab = 1;

                this.isSet = function(checkTab) {
                    return this.tab === checkTab;
                };

                this.setTab = function(activeTab) {
                    this.tab = activeTab;
                };
            },
            controllerAs: 'tab'
        };
    });
})();
