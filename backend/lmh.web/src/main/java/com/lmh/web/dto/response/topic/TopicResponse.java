package com.lmh.web.dto.response.topic;

import com.lmh.web.common.constant.TypeTopic;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TopicResponse {
    private int id;
    private String name;
    private TypeTopic type;
    private String description;
}
