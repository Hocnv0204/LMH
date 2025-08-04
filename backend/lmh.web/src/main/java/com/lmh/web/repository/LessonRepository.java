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
    
    @Query("SELECT l FROM Lesson l " +
           "WHERE l.deleteFlag = false " +
           "AND (l.type = 'DEFAULT' OR " +
           "(l.type = 'USER_CREATION' AND l.topic.user.id = :userId)) " +
           "AND l.topic.level.name = :levelName " +
           "AND l.topic.language.name = :languageName " +
           "AND (:topicName IS NULL OR l.topic.name = :topicName)")
    Page<Lesson> findLessonsIncludingDefault(@Param("userId") Integer userId,
                                            @Param("levelName") String levelName,
                                            @Param("languageName") String languageName,
                                            @Param("topicName") String topicName,
                                            Pageable pageable);
} 
