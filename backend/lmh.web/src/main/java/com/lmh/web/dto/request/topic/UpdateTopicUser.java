package com.lmh.web.dto.request.topic;

import com.lmh.web.dto.request.level.LevelRequest;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UpdateTopicUser {
    private String name;
    private String description;
    private LevelRequest levelRequest;
}
