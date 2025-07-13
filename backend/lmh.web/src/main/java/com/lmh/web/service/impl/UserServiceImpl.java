package com.lmh.web.service.impl;

import com.lmh.web.common.exception.NotFoundException;
import com.lmh.web.model.User;
import com.lmh.web.repository.UserRepository;
import com.lmh.web.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;

    @Override
    public User getUserByUsername(String username) {
        Optional<User> userOptional = userRepository.findByUsername(username);
        if (userOptional.isEmpty()){
            throw new NotFoundException("Not found user - " + username);
        }
        return userOptional.get();
    }
}
