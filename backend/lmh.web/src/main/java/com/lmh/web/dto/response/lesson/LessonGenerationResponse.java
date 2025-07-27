package com.lmh.web.dto.response.lesson;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class LessonGenerationResponse {
    private Integer lessonId;
    private String status;
    private String message;
}