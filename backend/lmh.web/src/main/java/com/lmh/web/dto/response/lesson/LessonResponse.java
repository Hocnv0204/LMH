package com.lmh.web.dto.response.lesson;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class LessonResponse {
    private int id;
    private String name;
    private String paragraph;
    private String description;
    private String status;
    private String type;
    private LocalDateTime lastPractice;
} 