package com.lmh.web.repository;

import com.lmh.web.model.Lesson;
import com.lmh.web.model.Topic;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Integer>, JpaSpecificationExecutor<Lesson> {
    
    Optional<Lesson> findByName(String name);
    
    boolean existsByName(String name);
} 
