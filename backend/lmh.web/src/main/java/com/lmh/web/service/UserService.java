package com.lmh.web.service;

import com.lmh.web.model.User;

import java.util.Optional;

public interface UserService {
    User getUserByUsername(String username);
}
