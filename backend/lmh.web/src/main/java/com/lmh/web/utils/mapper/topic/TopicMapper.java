package com.lmh.web.utils.mapper.topic;

import com.lmh.web.dto.response.topic.TopicResponse;
import com.lmh.web.model.Topic;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface TopicMapper {
    List<TopicResponse> toResponseList(List<Topic> topics);
    TopicResponse toResponse(Topic topic);
}
