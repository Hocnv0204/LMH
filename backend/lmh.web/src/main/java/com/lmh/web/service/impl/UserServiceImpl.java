package com.lmh.web.service.impl;

import com.lmh.web.common.exception.NotFoundException;
import com.lmh.web.dto.request.user.UserRequest;
import com.lmh.web.dto.response.user.UserResponse;
import com.lmh.web.model.User;
import com.lmh.web.repository.UserRepository;
import com.lmh.web.service.UserService;
import com.lmh.web.utils.mapper.user.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;

    private final UserMapper userMapper;

    @Override
    public User getUserByUsername(String username) {
        Optional<User> userOptional = userRepository.findByUsername(username);
        if (userOptional.isEmpty()){
            throw new NotFoundException("Not found user - " + username);
        }
        return userOptional.get();
    }

    @Override
    public UserResponse getUserById(Integer id) {
        Optional<User> userOptional = userRepository.findById(id);
        if (userOptional.isEmpty()) {
            throw new NotFoundException("Not found user with id - " + id);
        }
        return userMapper.toResponse(userOptional.get());
    }

    @Override
    public UserResponse updateUser(Integer id, UserRequest userRequest) {
        Optional<User> userOptional = userRepository.findById(id);
        if (userOptional.isEmpty()) {
            throw new NotFoundException("Not found user with id - " + id);
        }
        userOptional.get().setName(userRequest.getName());
        userOptional.get().setEmail(userRequest.getEmail());
        userOptional.get().setPhoneNumber(userRequest.getPhoneNumber());
        userOptional.get().setDateOfBirth(userRequest.getDateOfBirth());
        userOptional.get().setSchool(userRequest.getSchool());
        
        return userMapper.toResponse(userRepository.save(userOptional.get()));
    }
}
