package com.lmh.web.utils.mapper.topic;

import com.lmh.web.dto.request.topic.AdminCreateTopicRequest;
import com.lmh.web.dto.request.topic.TopicRequest;
import com.lmh.web.dto.request.topic.UpdateTopicRequest;
import com.lmh.web.dto.response.topic.AdminTopicResponse;
import com.lmh.web.dto.response.topic.TopicResponse;
import com.lmh.web.model.Topic;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface TopicMapper {
    List<TopicResponse> toResponseList(List<Topic> topics);

    @Mapping(target = "languageName", source = "language.name")
    TopicResponse toResponse(Topic topic);

    /**
     * Chuyển đổi từ DTO tạo topic của USER sang Topic Entity.
     * Các trường như id, language, type, user sẽ được xử lý ở Service.
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "language", ignore = true)
    @Mapping(target = "type", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "lessons", ignore = true)
    @Mapping(target = "deleteFlag", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    Topic toEntity(TopicRequest topicRequest);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "language", ignore = true)
    @Mapping(target = "lessons", ignore = true)
    @Mapping(target = "type", ignore = true)
    @Mapping(target = "deleteFlag", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    void updateEntityFromRequest(UpdateTopicRequest request, @MappingTarget Topic topic);

    /**
     * Chuyển đổi từ Topic Entity sang AdminTopicResponse DTO.
     * @param topic Entity đầu vào
     * @return DTO cho admin
     */
    @Mapping(target = "languageName", source = "language.name")
    @Mapping(target = "lessonCount", expression = "java(topic.getLessons() != null ? (long) topic.getLessons().size() : 0L)")
    AdminTopicResponse toAdminResponse(Topic topic);

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
    Topic toAdminEntity(AdminCreateTopicRequest request);
}
