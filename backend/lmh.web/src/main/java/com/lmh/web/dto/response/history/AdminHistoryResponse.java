package com.lmh.web.dto.response.history;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class AdminHistoryResponse {
    private Integer id;
    private String question;
    private String answer;
    private String result;
    private LocalDateTime createdAt;
    private Integer userId;
    private String userName;
    private Integer lessonId;
    private String lessonName;
}