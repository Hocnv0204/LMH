package com.lmh.web.controller;

import com.lmh.web.dto.request.user.UserRequest;
import com.lmh.web.dto.response.CustomResponse;
import com.lmh.web.model.User;
import com.lmh.web.service.UserService;
import com.lmh.web.utils.mapper.user.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class UserController {
    
    private final UserService userService;
    
    @GetMapping("/users/{id}")
    public CustomResponse<?> getUserById(@PathVariable Integer id) {
        return new CustomResponse<>(userService.getUserById(id), HttpStatus.OK);
    }
    
    @PutMapping("/users/{id}")
    public CustomResponse<?> updateUser(
            @PathVariable Integer id,
            @RequestBody UserRequest userRequest) {
        return new CustomResponse<>(userService.updateUser(id, userRequest), HttpStatus.OK);
    }
}
