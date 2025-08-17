package com.lmh.web.dto.response.quiz;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnswerResponse {
    private boolean correct;
    private String message;
    private QuizQuestionResponse nextQuestion;
    private boolean isCompleted;
    private Integer currentQuestionNumber;
    private Integer totalQuestions;
}
