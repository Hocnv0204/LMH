package com.lmh.web.dto.response.stats;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class TopLessonStatsResponse {
    private Integer lessonId;
    private String lessonName;
    private long submissionCount;
}