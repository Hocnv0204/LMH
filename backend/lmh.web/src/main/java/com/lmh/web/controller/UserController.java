package com.lmh.web.controller;

import com.lmh.web.common.utils.PageableUtils;
import com.lmh.web.dto.request.user.UserRequest;
import com.lmh.web.dto.response.ApiResponse;
import com.lmh.web.dto.response.CustomResponse;
import com.lmh.web.dto.response.user.UserResponse;
import com.lmh.web.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    @GetMapping("user/leader_board")
    public ResponseEntity<ApiResponse<?>> getUserByPoint(
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sort
    ){
        Pageable pageable = PageableUtils.pageable(size , page , sortBy , sort ) ;
        Page<UserResponse> response = userService.getAllUsers(pageable) ;
        return ResponseEntity.ok(
                ApiResponse.builder()
                        .success(true)
                        .data(response)
                        .build()
        );
    }
}
