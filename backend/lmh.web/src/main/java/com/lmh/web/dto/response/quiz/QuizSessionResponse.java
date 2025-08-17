package com.lmh.web.dto.response.quiz;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizSessionResponse {
    private String sessionId;
    private Integer collectionId;
    private Integer totalQuestions;
    private Integer currentQuestionNumber;
    private String message;
}

