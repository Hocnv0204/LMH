package com.lmh.web.dto.request.quiz;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnswerRequest {
    @NotNull(message = "Quiz ID không được để trống")
    private String quizId;
    
    @NotBlank(message = "Question ID không được để trống")
    private String questionId;
    
    @NotBlank(message = "Đáp án không được để trống")
    private String selectedAnswer;
}
