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
    console.log(question);
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


exports.createSummary = function(req, res, next){
    console.log('creating summary');
    req.quiz = {
        results: req.quiz.results,
        summary: req.quiz.summary
    };
    next();
};

exports.read = function(req, res) {
    res.jsonp(req.quiz);
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

exports.performAction = function(req, res){
    var quiz = req.quiz;

    /*
        Functions for performing session actions
     */

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
                question.wrongAnswers.push(question.answer[0]);
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
        console.log(questions);

        return {
            dateStarted: Date.now(),
            questions: questions,
            doneQuestions: []
        };
    };

    var extractUserInfo = function(){//extracts user info from http headers
        return{
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            email: req.user.email,
            username: req.user.username,
            displayName: req.user.displayName
        };
    };

    //Setting up Model.update() parameters
    var conditions = {'_id':req.quiz._id};
    var update = {$set: {}};
    var callback = function(err, doc){
        if(err){
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }
    };

    /*
     Now act on decisions:
     */

    if(req.action === 'createUserAndSession'){
        //TODO
        console.log('creating user and session in quiz');
        var user = {
            completedQuizSessions: [],
            session: newSession(),
            info: extractUserInfo()
        };
        //now update quiz collection
        update.$set['users.' + req.user._id] = user;
        respondWithQuestion(res, user.session.questions[0]);
        console.log(conditions,update);
        Quiz.update(conditions, update, {}, callback);

    }
    else if(req.action === 'createSessionInUser'){//then create session in user and update
        console.log('creating session in user (in quiz)');
        console.log(req.user._id);
        console.log(req.quiz.users[req.user._id].completedQuizSessions);
        var userWithSession = {
            session: newSession(),//generate new session
            completedQuizSessions: req.quiz.users[req.user._id].completedQuizSessions,//retain old data
            info: extractUserInfo()//keeps user info updated by updating at the start of a session...
        };
        respondWithQuestion(res, userWithSession.session.questions[0]);
        //update quizzes collection
        update.$set['users.' + req.user._id] = userWithSession;
        Quiz.update(conditions, update, {}, callback);
    }
    else{//return current question
        console.log('returning current question');
        respondWithQuestion(res, quiz.users[req.user._id].session.questions[0]);
    }
};

exports.respond = function(req, res){
    respondWithQuestion(res, req.questionToSend);
    console.log('after response');
};

/*
   POST RESPONSE FUNCTIONS
 */

exports.handleData = function(req, res, next){
    var quiz = req.quiz;
    console.log(req);
    console.log(quiz.users);

    //extract answer info and move question to doneQuestions
    quiz.users[req.user._id].session.questions[0].userAnswer = req.body.userAnswer;
    quiz.users[req.user._id].session.questions[0].dateAnswered = Date.now();

    if(req.body.userAnswer === quiz.users[req.user._id].session.questions[0].correctAnswer){
        //calc marks just awarded
        console.log('CORRECT');
        req.pointsAwardedFeedback = quiz.users[req.user._id].session.questions[0].pointsAwarded;
    }
    quiz.users[req.user._id].session.doneQuestions.push(quiz.users[req.user._id].session.questions.shift());//move to doneQuestions

    //work out what to do next()
    if(quiz.users[req.user._id].session.questions.length === 0){//check if no q's left
        req.action = 'endSession';
        data.generateSessionSummary(req, res);//assigns summary to req.summary
    }
    else{//questions are left, respond with question
        req.action = 'respondWithQuestion';
        //add info for response
        quiz.users[req.user._id].session.questions[0].dateStarted = Date.now();//add date question started
    }

    next();
};

exports.respondToPost = function(req, res, next){
    var quiz = req.quiz;

    //responding to post
    if(req.action === 'endSession'){
        //setting up return summary...TEMP for now
        res.jsonp({
            nextQuestion: req.summary
        });
    }
    else{//session still in progress
        //return newQuestion
        req.questionToSend = quiz.users[req.user._id].session.questions[0];
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
        options;
    req.editedUser = {//initialise user object for update.
        completedQuizSessions: quiz.users[req.user._id].completedQuizSessions,
        session: quiz.users[req.user._id].session,
        info: quiz.users[req.user._id].info
    };
    var lastIndex = req.editedUser.session.doneQuestions.length - 1;
    req.editedUser.session.doneQuestions[lastIndex] = {
        userAnswer: req.editedUser.session.doneQuestions[lastIndex].userAnswer,
        dateAnswered: req.editedUser.session.doneQuestions[lastIndex].dateAnswered,
        questionId: req.editedUser.session.doneQuestions[lastIndex].questionId
    };

    if(req.action === 'endSession') {
        //move session to doneSessions, make session = false, ready for db update
        console.log(req.editedUser.session);
        console.log(req.summary);
        console.log('session ended');
        req.editedUser.completedQuizSessions.push(req.editedUser.session);
        req.editedUser.session = false;

        //update users collection
        conditions = {'_id':mongoose.Types.ObjectId(req.user._id)};
        console.log(conditions);
        console.log('LOGGED CONDITIONS');

        update = {//setting up update parameter
            $push: {
                'quizzes': {//push object to quizzes attribute array of User
                    quizSummary: quiz.summary[0],//with attribs of quiz summary from quiz creation
                    sessionSummary: req.summary//  and session summary just generated and returned to user at end of session
                }
            }
        };

        options = {upsert: true};

        User.update(conditions, update, options, function(err){console.log(err);});
        //
    }

    //Setting up Model.update() parameters;
    conditions = {'_id':req.quiz._id};
    update = {$set: {}};
    update.$set['users.' + req.user._id] = req.editedUser;
    console.log(quiz);
    console.log('quiz logged');

    var errorCallback = function(err, doc){
        if(err){
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }
    };

    Quiz.update(conditions, update, {}, errorCallback);
};

//END POST RESPONSE FUNCTIONS
