package com.lmh.web.repository;

import com.lmh.web.model.Topic;
import com.lmh.web.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository  extends JpaRepository<User, String> {
    Optional<User> findByUsername(String username);
}
