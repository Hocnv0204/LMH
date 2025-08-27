package com.lmh.web.service.user;

import com.lmh.web.dto.request.user.UserRequest;
import com.lmh.web.dto.response.user.UserResponse;
import com.lmh.web.model.User;

public interface
UserService {
    User getUserByUsername(String username);
    User getUserById(Integer id);
    UserResponse updateUser(Integer id, UserRequest userRequest);
}
