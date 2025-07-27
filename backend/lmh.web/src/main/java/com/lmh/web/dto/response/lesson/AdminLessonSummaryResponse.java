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
    private String status; // Trạng thái: GENERATING, COMPLETED, FAILED
    private TypeLesson type; // Loại: DEFAULT, USER_CREATION
    private String topicName;
    private LocalDateTime createdAt;
    private Boolean deleteFlag;
}