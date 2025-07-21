package com.lmh.web.service;

import com.lmh.web.dto.request.user.UserRequest;
import com.lmh.web.dto.response.user.UserResponse;
import com.lmh.web.model.User;

import java.util.Optional;

public interface UserService {
    User getUserByUsername(String username);
    UserResponse getUserById(Integer id);
    UserResponse updateUser(Integer id, UserRequest userRequest);
}
