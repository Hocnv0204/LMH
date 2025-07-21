package com.lmh.web.utils.mapper.user;

import com.lmh.web.dto.response.user.UserResponse;
import com.lmh.web.model.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserResponse toResponse(User user);
} 