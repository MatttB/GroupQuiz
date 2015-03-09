/**
 * Created by Matt on 30/01/2015.
 */
'use strict';

var generateSummary = function(originalQuestions, answeredQuestions, dateStarted) {
    //takes array of original questions (req.quiz.questions)
    //  and array of user's doneQuestions

    var returnOriginalQuestion = function(originalQuestions, answeredQuestion) {
        //takes a full session and all of the questions from the original quiz,
        return originalQuestions.filter(function(originalQuestion) {
            return originalQuestion.questionId.toString() === answeredQuestion.questionId.toString();
        });
        //returns the original question that matches the edited question
    };

    var summary = { //initalise summary
        timeElapsed: 0, //worked out by lastQuestion dateAnswered - dateStarted;
        averageTTA: 0, //worked out by summary.timeElapsed / (summary.nCorrect + summary.nWrong)
        nCorrect: 0, //incremented on iteration of answeredQuestions array
        nWrong: 0, //incremented on iteration of answeredQuestions array
        maxPoints: 0,
        nPoints: 0,
        questions: new Array(originalQuestions.length) //reserve memory for array, faster than .push();
    };
    answeredQuestions.forEach(function(answeredQuestion, index) {

        var originalQuestion = returnOriginalQuestion(originalQuestions, answeredQuestion);

        var workOutPoints = function() {//defining function to be used later.

            var toLower = function(stringValue) { //checks if is a string before calling toLower because it can be null and would error
                if (typeof stringValue === 'string') {
                    return stringValue.toLowerCase();
                }
                else {
                    return stringValue;
                }
            };

            //take supplied answer, array of correct answers, and boolean of whether to check capitalisation or not
            var matchInAnswerArray = function(answer, answers, checkCapitalisation) {
                if (checkCapitalisation) {
                    return (answers.indexOf(answer) !== -1); //true if there was a match, false if there was not
                }
                else if (!checkCapitalisation) {
                    for (var i = 0; i < answers.length; i++) {//iterate through each answer in answers array.
                        if (toLower(answers[i]) === toLower(answer)) { //standardise both answers
                            return true; //match
                        }
                    }
                    return false; //did not find it in array.
                }
                else { //shouldn't happen but mark wrong if error
                    return false;
                }
            };

            summary.maxPoints += originalQuestion[0].pointsAwarded;//increment max points by pointsAwarded value in originalquestion

            if (matchInAnswerArray(answeredQuestion.userAnswer, originalQuestion[0].answer, originalQuestion[0].ignoreCapitalisation)) {//if there's a match in answer array
                summary.nCorrect++;//increment nCorrect by 1
                summary.nPoints += originalQuestion[0].pointsAwarded;//increment nPoints by points awarded.
                return originalQuestion[0].pointsAwarded;//return the first question points awarded.
            }
            else {
                summary.nWrong++;//increment nWrong by 1
                return 0;
            }
        };

        summary.questions[index] = {//define question at index by object literal
            title: originalQuestion[0].title,//set title from original question
            questionImage: originalQuestion[0].questionImage,//same with image
            points: workOutPoints() //also increments nWrong or nCorrect, as well as sets points via return value.
        };

        //add time elapsed to question summary
        if (index !== 0) {//if not first element
            summary.questions[index].timeElapsed = answeredQuestion.dateAnswered - answeredQuestions[index - 1].dateAnswered;//assign time elapsed to current time minus time answered last question
        }
        else {//otherwise separate handler because there is no previous question date for the first one. Uses dateStarted.
            summary.questions[0].timeElapsed = answeredQuestion.dateAnswered - dateStarted;//substract dateStarted from current time. assign to time elapsed.
        }
    });

    summary.timeElapsed = (answeredQuestions[answeredQuestions.length - 1].dateAnswered - dateStarted);//total quiz time elapsed is date answered last question minus date started.
    summary.averageTTA = (summary.timeElapsed / (summary.nCorrect + summary.nWrong));//calculate the average time to answer each question.

    return summary;
};

exports.generateSessionSummary = function(req, res, session) {//called by middleware, calls subsequent generateSummary varaible defined above.
    if (req.action === 'endSession') {
        req.summary = generateSummary(req.quiz.questions, session.doneQuestions, session.dateStarted);
    }
};

exports.generateAnsweredQuizSummary = function(req, res) {
    //initialise variables
    var
        quiz = req.quiz,
        users = req.quiz.users,
        calcPercentage = function(got, max) {
            return (got / max) * 100;
        };

    //collections for tables
    var returnData = {
        summaryStats: {//summary sentence vars
            totalAttempts: 0,
            totalTimeSpent: 0
        },
        usersCollection: [],//users table
        sessionsCollection: [],//sessions table
        questionsCollection: []//questions table
    };

    //initialise temp vars for question collection data
    var questions = {};
    for (var i = 0; i < quiz.questions.length; i++) {
        questions[quiz.questions[i].questionId] = {
            title: quiz.questions[i].title,
            avgTTA: 0, //initialised at 0, so that we can increment it and then divide by the number of attempts to get an average
            avgFirstAttemptPercentage: 0, //still needs to be divided by (pointsAwarded * returnData.usersCollection.length)
            avgPercentage: 0,//still needs to be divided by (pointsAwarded * totalAttempts)
            avgLastAttemptPercentage: 0, //still needs to be divided by (pointsAwarded * returnData.usersCollection.length)
            pointsAwarded: quiz.questions[i].pointsAwarded //same reason
        };
    }


    for (var user in users) { //iterate through each user in users object
        if (users.hasOwnProperty(user)) {//make sure we are not iterating through default properties of objects in JS.
            user = users[user];


            var newUserRow = {//initalise user row via object literal.
                firstName: user.details.firstName,
                lastName: user.details.lastName,
                username: user.details.username,
                nAttempts: user.completedQuizSessions.length,
                timeSpent: 0,
                avgPercentage: 0
            };

            returnData.summaryStats.totalAttempts += newUserRow.nAttempts; //dealing with total attempts summary data

            var sessions = user.completedQuizSessions;
            for (var userSessionNumber = 0; userSessionNumber < sessions.length; userSessionNumber++) { //iterate through attempts of user array
                var session = sessions[userSessionNumber];

                newUserRow.timeSpent += session.sessionSummary.timeElapsed; //sessions[userSessionNumber]

                //Deal with sessionPercentage vars
                session.sessionPercentage = calcPercentage(session.sessionSummary.nPoints, session.sessionSummary.maxPoints);//calc percentage of points of session.


                //if this percentage is bigger than previous best percentage (or first percentage)
                if (sessions[userSessionNumber].sessionPercentage > newUserRow.bestPercentage || newUserRow.bestPercentage === undefined) {
                    newUserRow.bestPercentage = session.sessionPercentage;//then assign the best percentage to this one.
                    newUserRow.bestSessionTTA = session.sessionSummary.averageTTA;//same with averageTTA
                }

                //if this sessionpercentage is worse than the current worstpercentage OR currently no worst percentage
                if (session.sessionPercentage < newUserRow.worstPercentage || newUserRow.worstPercentage === undefined) {
                    newUserRow.worstPercentage = session.sessionPercentage;//assign this one to worstpercentage
                    newUserRow.worstSessionTTA = session.sessionSummary.averageTTA;//same with averageTTA
                }
                newUserRow.avgPercentage += session.sessionPercentage; //it's not yet an avg percentage (just a sum of percentages thus far)
                newUserRow.timeSpent += session.sessionSummary.timeElapsed;//increment users time spent by time elapsed in this session

                //iterate through questions for question statistics
                for (var qNumber = 0; qNumber < session.doneQuestions.length; qNumber++) {//iterate through each doneQuestion
                    var question = session.doneQuestions[qNumber];//init
                    var questionStats = questions[question.questionId];

                    if (questionStats) {
                        questionStats.avgTTA += question.timeElapsed; //still needs to be divided by totalAttempts
                        questionStats.title = question.title;

                        questionStats.avgPercentage += question.points;

                        if (userSessionNumber === 0) {
                            questionStats.avgFirstAttemptPercentage += question.points; //still needs to be divided by (pointsAwarded * returnData.usersCollection.length)
                        }
                        if ((userSessionNumber + 1) === sessions.length) {//if last question
                            questionStats.avgLastAttemptPercentage += question.points;//add points onto avg percentage. still needs to be divided.
                        }
                    }
                    else { //question doesn't exist anymore???
                        session.doneQuestions.splice(qNumber);//so remove the question...
                    }


                }

                //push a session to sessionsCollection, element defined in place via object literal
                returnData.sessionsCollection.push({
                    firstName: newUserRow.firstName,
                    lastName: newUserRow.lastName,
                    username: newUserRow.username,
                    attemptNumber: userSessionNumber,
                    attemptPercentage: sessions[userSessionNumber].sessionPercentage,
                    attemptLength: sessions[userSessionNumber].sessionSummary.timeElapsed
                });
                //
            }

            newUserRow.avgPercentage = newUserRow.avgPercentage / user.completedQuizSessions.length;//divide the current total percentage by the number of quizzes to get avg
            //sessionPercentage vars dealt with

            //increment total time spent with this user's time spent
            returnData.summaryStats.totalTimeSpent += newUserRow.timeSpent;

            //push user to usersCollection
            returnData.usersCollection.push(newUserRow);
        }
    }


    for (var index = 0; index < quiz.questions.length; index++) { //question is the questionId
        questions[quiz.questions[index].questionId].avgFirstAttemptPercentage = 100 * (questions[quiz.questions[index].questionId].avgFirstAttemptPercentage / (quiz.questions[index].pointsAwarded * returnData.usersCollection.length));
        questions[quiz.questions[index].questionId].avgPercentage = 100 * (questions[quiz.questions[index].questionId].avgPercentage / returnData.summaryStats.totalAttempts);
        questions[quiz.questions[index].questionId].avgLastAttemptPercentage = 100 * (questions[quiz.questions[index].questionId].avgLastAttemptPercentage / (quiz.questions[index].pointsAwarded * returnData.usersCollection.length));
        questions[quiz.questions[index].questionId].avgTTA /= returnData.summaryStats.totalAttempts;
        returnData.questionsCollection.push(questions[quiz.questions[index].questionId]);

    }

    res.jsonp({ //I had to respond via object literal rather than req.quiz because for some reason I couldn't add an attribute (generatedData) to req.quiz and return it properly...
        _id: quiz._id,
        __v: quiz.__v,
        settings: quiz.settings,
        summary: quiz.summary,
        users: quiz.users,
        questions: quiz.questions,
        generatedData: returnData
    });
};
