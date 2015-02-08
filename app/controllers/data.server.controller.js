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

            summary.maxPoints = summary.maxPoints + originalQuestion[0].pointsAwarded;

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
        nQuestions = req.quiz.questions.length,
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

    for(var user in users){//iterate through each user in users object
        console.log('aUser');
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

            var userSessionNumber = 0;
            for (var attempt in user.completedQuizSessions) {//iterate through attempts of user

                attempt = user.completedQuizSessions[attempt];
                userSessionNumber++;
                newUserRow.timeSpent += attempt.sessionSummary.timeElapsed;

                //Deal with sessionPercentage vars
                attempt.sessionPercentage = calcPercentage(attempt.sessionSummary.nPoints, attempt.sessionSummary.maxPoints);
                console.log(attempt.sessionPercentage,'sessionPercentage^');

                if (attempt.sessionPercentage > newUserRow.bestPercentage) {
                    newUserRow.bestPercentage = attempt.sessionPercentage;
                    newUserRow.bestSessionTTA = attempt.sessionSummary.averageTTA;
                }

                if (attempt.sessionPercentage < newUserRow.worstPercentage) {
                    newUserRow.worstPercentage = attempt.sessionPercentage;
                    newUserRow.worstSessionTTA = attempt.sessionSummary.averageTTA;
                }
                newUserRow.avgPercentage += attempt.sessionPercentage;//it's not yet an avg percentage (just a sum of percentages thus far)
                newUserRow.timeSpent += attempt.sessionSummary.timeElapsed;

                //push a session to sessionsCollection
                returnData.sessionsCollection.push({
                    firstName: newUserRow.firstName,
                    lastName: newUserRow.lastName,
                    username: newUserRow.username,
                    attemptNumber: userSessionNumber,
                    attemptPercentage: attempt.sessionPercentage,
                    attemptLength: attempt.sessionSummary.timeElapsed
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























