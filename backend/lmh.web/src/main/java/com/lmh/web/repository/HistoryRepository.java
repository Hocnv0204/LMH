package com.lmh.web.repository;

import com.lmh.web.model.History;
import com.lmh.web.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface HistoryRepository extends JpaRepository<History, String> {
    Page<History> findByUser(User user);
    Optional<History> findById(Integer id);
}
