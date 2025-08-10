package com.lmh.web.dto.request.quiz;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StartQuizRequest {
    @NotNull(message = "Collection ID is required")
    private Integer collectionId;
    
    @NotNull(message = "Total questions is required")
    @Min(value = 1, message = "Total questions must be at least 1")
    private Integer totalQuestions;
    
    private Long seed; // Optional seed for deterministic shuffling
}
