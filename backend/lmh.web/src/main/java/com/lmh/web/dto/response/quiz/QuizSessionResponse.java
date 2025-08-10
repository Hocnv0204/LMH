package com.lmh.web.dto.response.quiz;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class QuizSessionResponse {
    private String sessionId;
    private Integer collectionId;
    private Integer totalQuestions;
    private Integer currentQuestionNumber;
    private String message;
}
