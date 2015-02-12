/**
 * Created by Matt on 30/01/2015.
 */
'use strict';

var generateSummary = function(originalQuestions, answeredQuestions, dateStarted){
    //takes array of original questions (req.quiz.questions)
    //  and array of user's doneQuestions

    var returnOriginalQuestion = function(originalQuestions, answeredQuestion){
        //takes a full session and all of the questions from the original quiz,
        return originalQuestions.filter(function(originalQuestion){
                return originalQuestion.questionId.toString() === answeredQuestion.questionId.toString();
            }
        );
        //returns the original question that matches the edited question
    };

    var summary = {//initalise summary
        timeElapsed: 0,//worked out by lastQuestion dateAnswered - dateStarted;
        averageTTA: 0,//worked out by summary.timeElapsed / (summary.nCorrect + summary.nWrong)
        nCorrect: 0,//incremented on iteration of answeredQuestions array
        nWrong: 0,//incremented on iteration of answeredQuestions array
        maxPoints: 0,
        nPoints: 0,
        questions: new Array(originalQuestions.length)//reserve memory for array, faster than .push();
    };
    answeredQuestions.forEach(function(answeredQuestion, index){

        var originalQuestion = returnOriginalQuestion(originalQuestions, answeredQuestion);

        var workOutPoints = function(){
            console.log('working out points');

            var toLower = function(stringValue){//checks if is a string before calling toLower because it can be null and would error
                if(typeof stringValue === 'string'){
                    return stringValue.toLowerCase();
                }
                else{
                    return stringValue;
                }
            };

            summary.maxPoints += originalQuestion[0].pointsAwarded;
            if (originalQuestion[0].answer[0] === answeredQuestion.userAnswer){
                summary.nCorrect ++;
                summary.nPoints = summary.nPoints + originalQuestion[0].pointsAwarded;
                return originalQuestion[0].pointsAwarded;
            }
            else if(originalQuestion[0].ignoreCapitalisation && (toLower(answeredQuestion.userAnswer) === originalQuestion[0].answer[0].toLowerCase())){
                summary.nCorrect ++;
                summary.nPoints = summary.nPoints + originalQuestion[0].pointsAwarded;
                return originalQuestion[0].pointsAwarded;
            }
            else{
                summary.nWrong ++;
                return 0;
            }
        };

        summary.questions[index] = {
            title: originalQuestion[0].title,
            questionImage: originalQuestion[0].questionImage,
            points: workOutPoints()//also increments nWrong or nCorrect
        };

        //add time elapsed to question summary
        if(index !== 0) {
            summary.questions[index].timeElapsed = answeredQuestion.dateAnswered - answeredQuestions[index - 1].dateAnswered;
            console.log(answeredQuestion.dateAnswered - answeredQuestions[index - 1].dateAnswered);
        }
        else{
            summary.questions[0].timeElapsed = answeredQuestion.dateAnswered - dateStarted;
        }
    });

    summary.timeElapsed = (answeredQuestions[answeredQuestions.length - 1].dateAnswered - dateStarted);
    summary.averageTTA = (summary.timeElapsed/(summary.nCorrect + summary.nWrong));

    return summary;
};

exports.generateSessionSummary = function(req, res, session){
    console.log('generating session summary');
    if(req.action === 'endSession'){
        console.log('req.action === endSession');
        req.summary = generateSummary(req.quiz.questions, session.doneQuestions, session.dateStarted);
    }
};

exports.generateAnsweredQuizSummary = function(req, res){
    //TODO
    //initialise variables
    var
        quiz = req.quiz,
        users = req.quiz.users,
        calcPercentage = function(got, max){
            return (got/max)*100;
        };

    //collections for tables
    var returnData = {
        summaryStats: {
            totalAttempts: 0,
            totalTimeSpent: 0
        },
        usersCollection: [],
        sessionsCollection: [],
        questionsCollection: []
    };

    //initialise temp vars for question collection data
    var questions = {};
    for(var i = 0; i < quiz.questions.length; i++){
        questions[quiz.questions[i].questionId] = {
            title: quiz.questions[i].title,
            avgTTA: 0,//initialised at 0, so that we can increment it and then divide by the number of attempts to get an average
            avgFirstAttemptPercentage: 0,//still needs to be divided by (pointsAwarded * returnData.usersCollection.length)
            avgLastAttemptPercentage: 0,//still needs to be divided by (pointsAwarded * returnData.usersCollection.length)
            pointsAwarded: quiz.questions[i].pointsAwarded//same reason
        };
    }

    console.log(users);

    for(var user in users){//iterate through each user in users object
        if(users.hasOwnProperty(user)) {
            user = users[user];

            console.log(user);

            var newUserRow = {
                firstName: user.details.firstName,
                lastName: user.details.lastName,
                username: user.details.username,
                nAttempts: user.completedQuizSessions.length,
                timeSpent: 0,
                avgPercentage: 0
            };

            returnData.summaryStats.totalAttempts += newUserRow.nAttempts;//dealing with total attempts summary data

            var sessions = user.completedQuizSessions;
            for (var userSessionNumber = 0; userSessionNumber < sessions.length; userSessionNumber++) {//iterate through attempts of user array
                var session = sessions[userSessionNumber];

                newUserRow.timeSpent += session.sessionSummary.timeElapsed;//sessions[userSessionNumber]

                //Deal with sessionPercentage vars
                session.sessionPercentage = calcPercentage(session.sessionSummary.nPoints, session.sessionSummary.maxPoints);
                console.log(sessions[userSessionNumber].sessionPercentage,'sessionPercentage^');

                if (sessions[userSessionNumber].sessionPercentage > newUserRow.bestPercentage || newUserRow.bestPercentage === undefined) {
                    newUserRow.bestPercentage = session.sessionPercentage;
                    newUserRow.bestSessionTTA = session.sessionSummary.averageTTA;
                }

                if (session.sessionPercentage < newUserRow.worstPercentage || newUserRow.worstPercentage === undefined) {
                    newUserRow.worstPercentage = session.sessionPercentage;
                    newUserRow.worstSessionTTA = session.sessionSummary.averageTTA;
                }
                newUserRow.avgPercentage += session.sessionPercentage;//it's not yet an avg percentage (just a sum of percentages thus far)
                newUserRow.timeSpent += session.sessionSummary.timeElapsed;

                //iterate through questions for question statistics
                for(var qNumber = 0; qNumber < session.doneQuestions.length; qNumber++){
                    var question = session.doneQuestions[qNumber];
                    var questionStats = questions[question.questionId];

                    questionStats.avgTTA += question.timeElapsed;//still needs to be divided by totalAttempts
                    questionStats.title = question.title;

                    if(userSessionNumber === 0){
                        questionStats.avgFirstAttemptPercentage += question.points;//still needs to be divided by (pointsAwarded * returnData.usersCollection.length)
                    }
                    if((userSessionNumber + 1) === sessions.length){
                        questionStats.avgLastAttemptPercentage += question.points;
                    }
                }

                //push a session to sessionsCollection
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

            newUserRow.avgPercentage = newUserRow.avgPercentage / user.completedQuizSessions.length;
            //sessionPercentage vars dealt with

            //increment total time spent with this user's time spent
            returnData.summaryStats.totalTimeSpent += newUserRow.timeSpent;

            //push user to usersCollection
            returnData.usersCollection.push(newUserRow);
        }
    }

    console.log(questions);
    console.log(quiz.questions.length);

    for(var index = 0; index < quiz.questions.length; index++){//question is the questionId
        questions[quiz.questions[index].questionId].avgFirstAttemptPercentage = 100 * (questions[quiz.questions[index].questionId].avgFirstAttemptPercentage / (quiz.questions[index].pointsAwarded * returnData.usersCollection.length));
        questions[quiz.questions[index].questionId].avgLastAttemptPercentage = 100 * (questions[quiz.questions[index].questionId].avgLastAttemptPercentage / (quiz.questions[index].pointsAwarded * returnData.usersCollection.length));
        questions[quiz.questions[index].questionId].avgTTA /= returnData.summaryStats.totalAttempts;
        console.log('question:');
        console.log(questions[quiz.questions[index].questionId]);
        returnData.questionsCollection.push(questions[quiz.questions[index].questionId]);

    }

    console.log(returnData.questionsCollection);

    console.log(returnData);
    res.jsonp({//I had to respond via object literal rather than req.quiz because for some reason I couldn't add an attribute (generatedData) to req.quiz and return it properly...
        _id: quiz._id,
        __v: quiz.__v,
        settings: quiz.settings,
        summary: quiz.summary,
        users: quiz.users,
        questions: quiz.questions,
        generatedData: returnData
    });
};























