package com.lmh.web.dto.request.quiz;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StartQuizRequest {
    @NotNull(message = "Collection ID không được để trống")
    private Integer collectionId;
    
    @NotNull(message = "Số lượng câu hỏi không được để trống")
    @Min(value = 1, message = "Số lượng câu hỏi phải lớn hơn 0")
    private Integer questionCount;
    
    private Long seed; // Để đảm bảo tính nhất quán khi random
}

