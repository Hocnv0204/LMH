package com.lmh.web.dto.request.lesson;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminUpdateLessonRequest {

    private String name;
    private String paragraph;
    private String note;
    private String description;
}