package com.lmh.web.service;

import com.lmh.web.dto.request.quiz.StartQuizRequest;
import com.lmh.web.dto.request.quiz.AnswerQuizRequest;
import com.lmh.web.dto.response.quiz.QuizQuestionResponse;
import com.lmh.web.dto.response.quiz.QuizSessionResponse;

public interface QuizService {
    QuizSessionResponse startQuiz(StartQuizRequest request, Integer userId);
    QuizQuestionResponse answerQuestion(AnswerQuizRequest request, String sessionId, Integer userId);
    QuizQuestionResponse getCurrentQuestion(String sessionId, Integer userId);
    void endQuiz(String sessionId, Integer userId);
}
