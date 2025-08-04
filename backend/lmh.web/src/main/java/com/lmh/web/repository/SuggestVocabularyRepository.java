package com.lmh.web.repository;

import com.lmh.web.model.SuggestVocabulary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SuggestVocabularyRepository extends JpaRepository<SuggestVocabulary, Integer> {
    
    @Query("SELECT sv FROM SuggestVocabulary sv " +
           "WHERE sv.deleteFlag = false " +
           "AND sv.lesson.id = :lessonId")
    Page<SuggestVocabulary> findSuggestVocabulariesByLessonId(@Param("lessonId") Integer lessonId, Pageable pageable);
} 
