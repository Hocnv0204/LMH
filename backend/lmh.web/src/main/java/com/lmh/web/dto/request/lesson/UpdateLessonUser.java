package com.lmh.web.dto.request.lesson;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UpdateLessonUser {
    private String name;
    private String paragraph;
    private String note;
    private String description;
    private String topicName;
} 