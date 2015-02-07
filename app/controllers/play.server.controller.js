/**
 * Created by Matt on 24/01/2015.
 */
'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors'),
    Quiz = mongoose.model('Quiz'),
    _ = require('lodash'),
    User = mongoose.model('User'),
    data = require('./data');

//Function for generating question response from quiz input

var pruneQuestion = function(question){
    console.log('pruning question');
    return{
        title: question.title,
        hint: question.hint,
        timeLimit: question.timeLimit,
        questionType: question.questionType,
        pointsAwarded: question.pointsAwarded,
        nQuestions: question.nQuestions,
        qNumber: question.qNumber,
        answers: question.answers,
        dateStarted: question.dateStarted,
        pointsAwardedFeedback: question.pointsAwardedFeedback
    };
};

var respondWithQuestion = function(res, question){
    res.jsonp(pruneQuestion(question));
};

/**
 * Handling /play:id
 */

exports.handleGetResponse = function(req, res, next){
    console.log('REQ ENDED');

    var newSession = function(){//constructor function, though using object literal as it does not contain methods
        var shuffleArray = function(array) {//shuffle array using implementation of Fisher-Yates' Knuth Shuffle
            for (var i = array.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var temp = array[i];
                array[i] = array[j];
                array[j] = temp;
            }
            return array;
        };
        var appendQuestionCallback = function(question, index){
            var newQuestion = {//new question definition by object literal
                'questionId': question.questionId,
                'title': question.title,
                'questionImage': question.questionImage,
                'timeLimit': question.timeLimit,
                'questionType': question.questionType,
                'pointsAwarded': question.pointsAwarded,
                'nQuestions': nQuestions,
                'correctAnswer': question.answer[0]//REMOVE BEFORE RESPONDING
            };
            if(req.quiz.users[req.user._id]){//if it defined... ie. does the user exist in the quiz coll yet?
                if(req.quiz.users[req.user._id].completedQuizSessions.length >= question.attemptsBeforeHint ){//nSessions >= nNeededForHint???
                    newQuestion.hint = question.hint;
                }
            }
            else{//user does not exist yet, so it's the first session.
                if(question.attemptsBeforeHint < 1){
                    newQuestion.hint = question.hint;
                }
            }
            if(question.questionType === 'Multiple Choice'){
                var multipleChoiceOptions = question.wrongAnswers;
                multipleChoiceOptions.push(question.answer[0]);
                newQuestion.answers = shuffleArray(multipleChoiceOptions);//return and assign shuffled answer order so they can't just remember "it's the first answer"
            }
            questions[index] = newQuestion;
        };

        //creating questions:
        var nQuestions = quiz.questions.length;
        var questions = new Array(nQuestions);//pre-allocate array memory, saves 10x time on creation than a loop of repeated push()'s
        quiz.questions.forEach(appendQuestionCallback);
        if(quiz.settings[0].randomizeOrder){
            questions = shuffleArray(questions);
        }
        questions.forEach(function(question, index){
            question.qNumber = index+1;
        });

        return {
            dateStarted: Date.now(),
            questions: questions,
            doneQuestions: [],
            quizId: quizIdFromUrl,
            settings: quiz.settings
        };
    };




    var
        user = req.user,
        quizIdFromUrl = req.param('quizId'),
        quiz = req.quiz;

    if(req.user.session){//session exists
        if(user.session.quizId === quizIdFromUrl){//trying to access current session
            console.log('trying to access current session');
            //returning current question
            respondWithQuestion(res, user.session.questions[0]);
        }
        else{
            //TODO...
            console.log('trying to access session when session from another quiz exists');
            res.jsonp();
        }
    }
    else{//no session exists
        console.log('no session exists');
        var session = newSession();

        respondWithQuestion(res, session.questions[0]);
        var
            conditions = {
                _id: user._id
            },
            update = {
                $set: {
                    session: session
                }
            },
            options = {

            },
            callback = function(err){
                console.log(err);
            };


        User.update(conditions, update, options, callback);
    }
};

exports.quizByID = function(req, res, next, id) { Quiz.findById(id).populate('user', 'displayName').exec(function(err, quiz) {
    console.log('quizByID: ' + id);
    if (err) return next(err);
    if (! quiz) return next(new Error('Failed to load Quiz ' + id));
    req.quiz = quiz;
    next();
});
};

exports.workOutAction = function(req, res, next){
    console.log('working out action../');
    var quiz = req.quiz;//working out based on quiz data from DB.
    var user = req.user;//using user data
    if(quiz.users[user._id]){//user exists
        console.log('user exists');
        if(!quiz.users[user._id].session){//no session but user exists
            req.action = 'createSessionInUser';
            console.log('no session but user exists');
            //insert session, start on question 1, res.currentQuestion = 5
        }
        else if(quiz === 5){//session in progress for user
            req.action = 'returnCurrentQuestion';
            console.log('session in progress for user');

        }
    }
    else{//user does not exist, quiz.users.userId === undefined
        req.action = 'createUserAndSession';
        console.log('user does not exist in quiz, inserting user and session 1');
        //creating user and current quiz session in quiz
    }
    next();
};

exports.respond = function(req, res){
    respondWithQuestion(res, req.questionToSend);
    console.log('after response');
};

/*
   POST RESPONSE FUNCTIONS
 */

exports.handleData = function(req, res, next){
    var
        user = req.user,
        session = req.user.session,
        quiz = req.quiz;

    //extract answer info and move question to doneQuestions
    session.questions[0].userAnswer = req.body.userAnswer;
    session.questions[0].dateAnswered = Date.now();

    if(req.body.userAnswer === session.questions[0].correctAnswer){
        //calc marks just awarded
        console.log('CORRECT');
        req.pointsAwardedFeedback = session.questions[0].pointsAwarded;
    }
    session.doneQuestions.push(session.questions.shift());//move to doneQuestions

    //work out what to do next()
    if(session.questions.length === 0){//check if no q's left
        req.action = 'endSession';
        data.generateSessionSummary(req, res, session);//assigns summary to req.summary
    }
    else{//questions are left, respond with question
        req.action = 'respondWithQuestion';
        //add info for response
        session.questions[0].dateStarted = Date.now();//add date question started
    }

    next();
};

exports.respondToPost = function(req, res, next){
    var session = req.user.session;

    //responding to post
    if(req.action === 'endSession'){
        //setting up return summary...TEMP for now
        res.jsonp({
            nextQuestion: req.summary
        });
    }
    else{//session still in progress
        //return newQuestion
        req.questionToSend = session.questions[0];
        req.questionToSend.pointsAwardedFeedback = req.pointsAwardedFeedback;
        res.jsonp({nextQuestion: pruneQuestion(req.questionToSend)});//return sanitized question, making sure no sensitive data is returned EG a correct answer
    }
    next();
};

exports.updateDB = function(req, res){
    console.log('afterRes db update');
    var quiz = req.quiz;
    var conditions,
        update,
        options,
        session = req.user.session;

    var lastIndex = session.doneQuestions.length - 1;
    session.doneQuestions[lastIndex] = {
        userAnswer: session.doneQuestions[lastIndex].userAnswer,
        dateAnswered: session.doneQuestions[lastIndex].dateAnswered,
        questionId: session.doneQuestions[lastIndex].questionId
    };

    var errorCallback = function(err, doc){
        if(err){
            console.log(errorHandler.getErrorMessage(err));
        }
    };

    if(req.action === 'endSession') {
        //move session to doneSessions, make session = false, ready for db update
        console.log('session ended');

        //update users collection
        conditions = {'_id':mongoose.Types.ObjectId(req.user._id)};

        update = {//setting up update parameter
            $push: {
                'completedQuizzes': {//push object to quizzes attribute array of User
                    quizSummary: quiz.summary[0],//with attribs of quiz summary from quiz creation
                    sessionSummary: req.summary//  and session summary just generated and returned to user at end of session
                }
            },
            session: false
        };

        options = {upsert: true};

        console.log('updating USER');
        User.update(conditions, update, options, errorCallback);
        //
        //update quiz collection
        //Setting up model Quiz.update() parameters;
        conditions = {'_id': mongoose.Types.ObjectId(quiz._id)};

        update = {
            $push:{

            }
        };

        update.$push['users.' + req.user._id + '.completedQuizSessions'] = session;

        //options stays the same
        console.log('Updating QUIZ');
        Quiz.update(conditions, update, {}, errorCallback);

    }
    else{//req.action === respondWithQuestion (probably)
        //update users collections with newSession
        conditions = {'_id': mongoose.Types.ObjectId(req.user._id)};

        update = {session: session};

        options = {};

        //error callback function the same

        User.update(conditions, update, options, errorCallback);
    }
};

//END POST RESPONSE FUNCTIONS
