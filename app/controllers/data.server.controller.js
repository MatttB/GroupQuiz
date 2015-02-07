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
    return;
};
