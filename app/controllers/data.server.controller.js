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
        questions: new Array(originalQuestions.length)//reserve memory for array, faster than .push();
    };
    answeredQuestions.forEach(function(answeredQuestion, index){
        console.log(answeredQuestion);

        var originalQuestion = returnOriginalQuestion(originalQuestions, answeredQuestion);
        console.log('logging OG question');
        console.log(originalQuestion);

        var workOutPoints = function(){
            if (originalQuestion[0].answer[0] === answeredQuestion.userAnswer){
                summary.nCorrect ++;
                return originalQuestion.pointsAwarded;
            }
            else if(originalQuestion.ignoreCapitalisation && (answeredQuestion.userAnswer.toLowerCase() === originalQuestion.answer[0].toLowerCase())){
                summary.nCorrect ++;
                return originalQuestion.pointsAwarded;
            }
            else{
                summary.nWrong ++;
                return 0;
            }
        };

        summary.questions[index] = {
            title: originalQuestion.title,
            questionImage: originalQuestion.questionImage,
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

exports.generateSessionSummary = function(req, res){
    console.log('generating session summary');
    console.log('req2:', req.quiz.questions);
    if(req.action === 'endSession'){
        console.log('req.action === endSession');
        console.log(req.quiz.users[req.user._id].session.doneQuestions);
        req.summary = generateSummary(req.quiz.questions, req.quiz.users[req.user._id].session.doneQuestions, req.quiz.users[req.user._id].session.dateStarted);
    }
};
