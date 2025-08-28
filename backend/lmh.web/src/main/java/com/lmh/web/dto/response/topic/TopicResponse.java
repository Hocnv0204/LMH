package com.lmh.web.dto.response.topic;

import com.lmh.web.common.constant.TypeTopic;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class  TopicResponse {
    private int id;
    private String name;
    private String description;
    private LocalDateTime createdAt;
    private String languageName;
}
