package com.lmh.web.dto.response.history;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class HistoryResponse {
    private Integer id;
    private String question;
    private String result;
    private String answer;
    private LocalDateTime createdAt;

    private Integer lessonId;
    private String lessonName;
}
