package com.lmh.web.utils.mapper.user;

import com.lmh.web.dto.request.user.AdminUpdateUserRequest;
import com.lmh.web.dto.response.user.AdminUserDetailResponse;
import com.lmh.web.dto.response.user.AdminUserSummaryResponse;
import com.lmh.web.dto.response.user.UserResponse;
import com.lmh.web.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface UserMapper {
    UserResponse toResponse(User user);

    AdminUserSummaryResponse toAdminSummaryResponse(User user);

    @Mapping(target = "topicCount", expression = "java(user.getTopics() != null ? (long) user.getTopics().size() : 0L)")
    @Mapping(target = "lessonCount", expression = "java(user.getLessons() != null ? (long) user.getLessons().size() : 0L)")
    AdminUserDetailResponse toAdminDetailResponse(User user);

    void updateEntityFromRequest(AdminUpdateUserRequest request, @MappingTarget User user);
} 