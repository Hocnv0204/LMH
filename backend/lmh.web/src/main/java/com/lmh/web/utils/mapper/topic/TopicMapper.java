package com.lmh.web.utils.mapper.topic;

import com.lmh.web.dto.request.topic.AdminCreateTopicRequest;
import com.lmh.web.dto.request.topic.TopicRequest;
import com.lmh.web.dto.response.topic.AdminTopicResponse;
import com.lmh.web.dto.response.topic.TopicResponse;
import com.lmh.web.model.Topic;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface TopicMapper {
    List<TopicResponse> toResponseList(List<Topic> topics);
    TopicResponse toResponse(Topic topic);
    Topic toEntity(TopicRequest topicRequest);

    /**
     * Chuyển đổi từ Topic Entity sang AdminTopicResponse DTO.
     * @param topic Entity đầu vào
     * @return DTO cho admin
     */
    @Mapping(target = "languageName", source = "language.name")
    @Mapping(target = "lessonCount", expression = "java(topic.getLessons() != null ? (long) topic.getLessons().size() : 0L)")
    AdminTopicResponse toAdminResponse(Topic topic);

    List<AdminTopicResponse> toAdminResponseList(List<Topic> topics);

    /**
     * Chuyển đổi từ DTO tạo topic của admin sang Topic Entity.
     * Các trường như id, language, type, user sẽ được xử lý ở Service.
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "language", ignore = true)
    @Mapping(target = "type", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "lessons", ignore = true)
    @Mapping(target = "deleteFlag", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    Topic toEntity(AdminCreateTopicRequest request);
}
