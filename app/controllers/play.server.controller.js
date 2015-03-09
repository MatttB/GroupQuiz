/**
 * Created by Matt on 24/01/2015.
 */
'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),//import modules
    errorHandler = require('./errors'),
    Quiz = mongoose.model('Quiz'),
    _ = require('lodash'),
    User = mongoose.model('User'),
    data = require('./data');

//Function for generating question response from quiz input

var pruneQuestion = function(question) {
    console.log('pruning question');
    /*
    Returns only the variables reinitialised here.
    Removes any unwanted attributes that may have accumulated.
     */
    return {
        title: question.title,
        hint: question.hint,
        timeLimit: question.timeLimit,
        questionType: question.questionType,
        pointsAwarded: question.pointsAwarded,
        nQuestions: question.nQuestions,
        qNumber: question.qNumber,
        answers: question.answer,
        dateStarted: question.dateStarted,
        pointsAwardedFeedback: question.pointsAwardedFeedback,
        progress: 100 * ((question.qNumber - 1) / (question.nQuestions)),
        questionImage: question.questionImage
    };
};

var respondWithQuestion = function(res, question) {
    res.jsonp(pruneQuestion(question));
};

/**
 * Handling /play:id
 */

exports.checkSessionValidity = function(req, res, next) {//check that there is a current session ERROR HANDLER
    if (req.quiz.summary[0].dateLastUpdated > req.user.session.dateStarted) {
        console.log('invalid');
        /*
        Date last updated is after the date started
        session is now invalid
        Return ERROR
         */
        res.jsonp({//respond with error via jsonp
            'nextQuestion': 'error',
            'error': 'The quiz creator has updated the quiz so your quiz session must be restarted.'
        });
        User.update({//update user with in-line update parameter definitions
            '_id': req.user._id//query on _id attribute
        }, {
            $set: {
                session: false//set current session to false. removes all of the data
            }
        }, {}, function(err) {//ERROR HANDLER function
            console.log(err);//LOG ERROR to console if error
        });
    }
    else {
        return;
    }
};

exports.handleGetResponse = function(req, res) {//first handler for Get
    console.log('REQ ENDED');

    var newSession = function() { //constructor function, though using object literal as it does not contain methods
        var shuffleArray = function(array) { //shuffle array using implementation of Fisher-Yates' Knuth Shuffle
            for (var i = array.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var temp = array[i];
                array[i] = array[j];
                array[j] = temp;
            }
            return array;
        };
        var appendQuestionCallback = function(question, index) {//function called from .forEach() iteration called from quiz.questions
            var newQuestion = { //new question definition by object literal
                'questionId': question.questionId,
                'title': question.title,
                'questionImage': question.questionImage,
                'timeLimit': question.timeLimit,
                'questionType': question.questionType,
                'pointsAwarded': question.pointsAwarded,
                'nQuestions': nQuestions,
                'correctAnswer': question.answer[0], //REMOVE BEFORE RESPONDING
                'allCorrectAnswers': question.answer
            };
            if (req.quiz.users[req.user._id]) { //if it defined... ie. does the user exist in the quiz coll yet?
                if (req.quiz.users[req.user._id].completedQuizSessions.length >= question.attemptsBeforeHint) { //nSessions >= nNeededForHint???
                    newQuestion.hint = question.hint;
                }
            }
            else { //user does not exist yet, so it's the first session.
                if (question.attemptsBeforeHint < 1) {
                    newQuestion.hint = question.hint;
                }
            }
            if (question.questionType === 'Multiple Choice') {
                var multipleChoiceOptions = question.wrongAnswers;
                multipleChoiceOptions.push(question.answer[0]);
                if(question.sortOptionsAlphabetically){//if it should be sorted
                    newQuestion.answer = multipleChoiceOptions.sort();//sort alphabetically using inbuilt JS function.
                }
                else{
                    newQuestion.answer = shuffleArray(multipleChoiceOptions); //return and assign shuffled answer order so they can't just remember "it's the first answer"
                }
                console.log(newQuestion.answer);
            }
            questions[index] = newQuestion;
        };

        //creating questions:
        var nQuestions = quiz.questions.length;
        var questions = new Array(nQuestions); //pre-allocate array memory, saves 10x time on creation than a loop of repeated push()'s
        quiz.questions.forEach(appendQuestionCallback);//call appendQuestionCallback for each element in questions array
        if (quiz.settings[0].randomizeOrder) {//is the order should be randomised
            questions = shuffleArray(questions);//shuffle the array using the Fisher-Yates' Knuth shuffle
        }
        questions.forEach(function(question, index) {//for each question in questions array
            question.qNumber = index + 1;//set the qNumber to the index plus one
        });

        return {//return an object literal of the just generated values
            dateStarted: Date.now(),//plus generate a Unix Timestamp as dateStarted attribute
            questions: questions,
            doneQuestions: [],
            quizId: quizIdFromUrl,
            settings: quiz.settings
        };
    };




    var//init vars
        user = req.user,
        quizIdFromUrl = req.param('quizId'),
        quiz = req.quiz;

    if (req.user.session) { //session exists
        if (user.session.quizId === quizIdFromUrl) { //trying to access current session
            console.log('trying to access current session');
            exports.checkSessionValidity(req, res);//check if the session is valid
            //returning current question
            respondWithQuestion(res, user.session.questions[0]);//respond with current question
        }
        else {
            //TODO...
            console.log('trying to access session when session from another quiz exists');
            res.jsonp({//respond with error via jsonp
                'nextQuestion': 'error',//type of response is ERROR
                'error': 'You are already doing a quiz at',
                'returnedId': user.session.quizId.toString()//ERROR HANDLER sending them to the correct quizId URL.
                //CORRECT URL BUILT UP ON CLIENT
            });
        }
    }
    else { //no session exists
        console.log('no session exists');
        var session = newSession();//no session exists so generate session.

        respondWithQuestion(res, session.questions[0]);//now session exists so respond with first question from the session
        var//initaialise User update parameters for DB update
            conditions = {
                _id: user._id//query on _id attribute.
            },
            update = {
                $set: {
                    session: session//set the new session just generated
                }
            },
            options = {//no options currently.

            },
            callback = function(err) {
                console.log(err);//ERROR HANDLER callback function logging error to console if there is one.
            };


        User.update(conditions, update, options, callback);//update User in DB passing in update parameters
    }
};

exports.quizByID = function(req, res, next, id) {
    Quiz.findById(id).populate('user', 'displayName').exec(function(err, quiz) {
        console.log('quizByID: ' + id);
        if (err) return next(err);
        if (!quiz) return next(new Error('Failed to load Quiz ' + id));
        req.quiz = quiz;
        next();
    });
};

exports.workOutAction = function(req, res, next) {
    console.log('working out action../');
    var quiz = req.quiz; //working out based on quiz data from DB.
    var user = req.user; //using user data
    if (quiz.users[user._id]) { //user exists
        console.log('user exists');
        if (!quiz.users[user._id].session) { //no session but user exists
            req.action = 'createSessionInUser';
            console.log('no session but user exists');
            //insert session, start on question 1, res.currentQuestion = 5
        }
        else if (quiz === 5) { //session in progress for user
            req.action = 'returnCurrentQuestion';
            console.log('session in progress for user');

        }
    }
    else { //user does not exist, quiz.users.userId === undefined
        req.action = 'createUserAndSession';
        console.log('user does not exist in quiz, inserting user and session 1');
        //creating user and current quiz session in quiz
    }
    next();
};

exports.respond = function(req, res) {
    respondWithQuestion(res, req.questionToSend);
    console.log('after response');
};

/*
 POST RESPONSE FUNCTIONS
 */

exports.handleData = function(req, res, next) {//first handler for handling POST reqiest
    exports.checkSessionValidity(req, res);//check session is still valid first...
    var//initalise session.
        session = req.user.session;

    //extract answer info and move question to doneQuestions
    session.questions[0].userAnswer = req.body.userAnswer;
    session.questions[0].dateAnswered = Date.now();//generate unix timestamp - time question was submitted.

    if (req.body.userAnswer === session.questions[0].correctAnswer) {//answer is correct
        //calc marks just awarded
        console.log('CORRECT');
        req.pointsAwardedFeedback = session.questions[0].pointsAwarded;//assign for client.
    }
    session.doneQuestions.push(session.questions.shift()); //move complete question to  array

    //work out what to do next()
    if (session.questions.length === 0) { //check if no q's left
        req.action = 'endSession';
        data.generateSessionSummary(req, res, session); //assigns summary to req.summary
    }
    else { //questions are left, respond with question
        req.action = 'respondWithQuestion';
        //add info for response
        session.questions[0].dateStarted = Date.now(); //add date question started
    }

    next();//call next middleware function
};

exports.respondToPost = function(req, res, next) {
    var session = req.user.session;

    //responding to post
    if (req.action === 'endSession') {//session has ended
        //setting up return summary...TEMP for now
        res.jsonp({//respond with summary of session via jsonp, as nextQuestion attribute
            nextQuestion: req.summary,//client knows that summary data is on nextQuestion attribute.
            questionImage: ''//no questionImage because it's a summary not a question
        });
    }
    else { //session still in progress
        //return newQuestion
        req.questionToSend = session.questions[0];//question to send is first element at index 0 of session.questions array.
        req.questionToSend.pointsAwardedFeedback = req.pointsAwardedFeedback;//assign the feedback.
        res.jsonp({//respond via jsonp with next question.
            nextQuestion: pruneQuestion(req.questionToSend)//prune the question for data return integrity.
        }); //return sanitized question, making sure no sensitive data is returned EG a correct answer
    }
    next();//call next middleware function
};

exports.updateDB = function(req) {//update DB AFTER RESPONSE
    console.log('afterRes db update');
    var quiz = req.quiz,//initialise variables
        user = req.user,
        conditions,
        update,
        options,
        session = req.user.session;

    var lastIndex = session.doneQuestions.length - 1;//last index of doneQuestions array.
    session.doneQuestions[lastIndex] = {//assign the last doneQuestion via object literal.
        userAnswer: session.doneQuestions[lastIndex].userAnswer,
        dateAnswered: session.doneQuestions[lastIndex].dateAnswered,
        questionId: session.doneQuestions[lastIndex].questionId
    };

    var errorCallback = function(err, doc) {//ERROR HANDLER
        if (err) {
            console.log(errorHandler.getErrorMessage(err));//log error to console
        }
    };

    if (req.action === 'endSession') {//if session has ended
        //move session to doneSessions, make session = false, ready for db update
        console.log('session ended');

        //update users collection
        conditions = {//set up conditions of query
            '_id': mongoose.Types.ObjectId(req.user._id)//query on _id atrtibute.
        };

        update = { //setting up update parameter
            $push: {//push to completedQuizzes array in MongoDB.
                'completedQuizzes': { //push object to quizzes attribute array of User
                    quizSummary: quiz.summary[0], //with attribs of quiz summary from quiz creation
                    sessionSummary: req.summary //  and session summary just generated and returned to user at end of session
                }
            },
            session: false//set session to false as there is now no session.
        };

        options = {
            upsert: true//if the completedQuizzes attribute is undefined then create one.
        };

        console.log('updating USER');
        User.update(conditions, update, options, errorCallback);//update the DB passing in the update parameters defined previously
        //

        //merging doneQuestions array objects' attributes with sessionSummary array object
        for (var i = 0; i < session.doneQuestions.length; i++) {//iterate through each question.
            for (var attributeName in req.summary.questions[i]) {//iterate through questions attributes.
                session.doneQuestions[i][attributeName] = req.summary.questions[i][attributeName];//merge.
            }
        }
        delete req.summary.questions;//delete the questions, no longer needed

        session = {//initialise via object literal
            dateStarted: session.dateStarted,
            doneQuestions: session.doneQuestions,
            sessionSummary: req.summary
        };

        //
        //updating quiz collection
        //Setting up model Quiz.update() parameters;
        conditions = {//set up conditions for quiz update.
            '_id': mongoose.Types.ObjectId(quiz._id)
        };
        if (quiz.users[user._id]) {//if user exists in quizzes collection already.
            update = {
                $push: {}
            };
            update.$push['users.' + req.user._id + '.completedQuizSessions'] = session;
        }//pushing to users.<id>.completedQuizSessions array in DB.
        else { //user does not exist in quizzes collection
            update = {
                $set: {}
            };
            update.$set['users.' + req.user._id] = {//uesr does not exist
                completedQuizSessions: [//so we can just define the completedQuizSessions array
                    session//as a one-element array of the completed session
                ],
                details: {//assign user details to the completed quiz.
                    firstName: user.firstName,
                    lastName: user.lastName,
                    displayName: user.displayname,
                    username: user.username,
                    email: user.email
                }
            };
        }

        //options stays the same
        console.log('Updating QUIZ');
        Quiz.update(conditions, update, {}, errorCallback);//update Quiz DB with parameters just defined.

    }
    else { //req.action === respondWithQuestion (probably)
        //update users collections with newSession
        conditions = {//query on _id parameter
            '_id': mongoose.Types.ObjectId(req.user._id)
        };

        update = {//set session to session just completed
            session: session
        };

        options = {};//no options currently

        //error callback function the same

        User.update(conditions, update, options, errorCallback);
        //update users collection with parameters just defined.
    }
};

//END POST RESPONSE FUNCTIONS
