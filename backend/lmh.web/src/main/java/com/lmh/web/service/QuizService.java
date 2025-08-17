package com.lmh.web.service;

import com.lmh.web.dto.request.quiz.StartQuizRequest;
import com.lmh.web.dto.request.quiz.AnswerRequest;
import com.lmh.web.dto.response.quiz.QuizQuestionResponse;
import com.lmh.web.dto.response.quiz.QuizSessionResponse;
import com.lmh.web.dto.response.quiz.AnswerResponse;

public interface QuizService {
    QuizSessionResponse startQuiz(StartQuizRequest request, Integer userId);
    AnswerResponse answerQuestion(AnswerRequest request, Integer userId);
    QuizQuestionResponse getCurrentQuestion(String quizId, Integer userId);
    void finishQuiz(String quizId, Integer userId);
}

