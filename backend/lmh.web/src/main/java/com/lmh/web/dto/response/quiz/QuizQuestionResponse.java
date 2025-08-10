package com.lmh.web.dto.response.quiz;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class QuizQuestionResponse {
    private String questionId;
    private String question;
    private List<String> options;
    private String correctAnswer;
    private boolean isCorrect;
    private String message;
    private boolean isCompleted;
    private Integer currentQuestionNumber;
    private Integer totalQuestions;
}
