package com.lmh.web.dto.response.topic;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AdminTopicResponse {

    private Integer id;
    private String name;
    private String description;
    private LocalDateTime createdAt;
    private String imageUrl;
    private Boolean deleteFlag;
    private String languageName; // Tên ngôn ngữ để hiển thị
    private long lessonCount; // Số lượng bài học trong topic
}
