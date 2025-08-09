package com.lmh.web.dto.response.language;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AdminLanguageResponse {

    private Integer id;
    private String name;
    private String languageCode;
    private String note;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean deleteFlag;
    private long topicCount; // Số lượng topic thuộc ngôn ngữ này
}
