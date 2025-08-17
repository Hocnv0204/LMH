package com.lmh.web.dto.request.quiz;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AnswerQuizRequest {
    @NotNull(message = "Question ID is required")
    private String questionId;
    
    @NotNull(message = "Answer is required")
    private String answer;
}

