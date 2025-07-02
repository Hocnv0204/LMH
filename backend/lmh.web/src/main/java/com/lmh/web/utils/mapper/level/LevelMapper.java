package com.lmh.web.utils.mapper.level;

import com.lmh.web.dto.response.level.LevelResponse;
import com.lmh.web.dto.response.topic.TopicResponse;
import com.lmh.web.model.Level;
import com.lmh.web.model.Topic;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface LevelMapper {
    List<LevelResponse> toResponseList(List<Level> levels);
}
