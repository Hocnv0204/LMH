package com.lmh.web.dto.response.lesson;

import com.lmh.web.common.constant.TypeLesson;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class AdminLessonSummaryResponse {
    private Integer id;
    private String name;
    private String topicName;
    private String levelName;
    private String languageName;
    private LocalDateTime createdAt;
    private Boolean deleteFlag;
}