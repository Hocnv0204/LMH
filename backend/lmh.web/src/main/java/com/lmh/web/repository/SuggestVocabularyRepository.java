package com.lmh.web.repository;

import com.lmh.web.model.SuggestVocabulary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SuggestVocabularyRepository extends JpaRepository<SuggestVocabulary, Integer> {
    
    @Query("SELECT sv FROM SuggestVocabulary sv " +
           "WHERE sv.deleteFlag = false " +
           "AND sv.lesson.id = :lessonId")
    Page<SuggestVocabulary> findSuggestVocabulariesByLessonId(@Param("lessonId") Integer lessonId, Pageable pageable);

    /**
     * Xóa tất cả các SuggestVocabulary thuộc về một lessonId cụ thể.
     * @Modifying báo cho Spring biết đây là một câu lệnh thay đổi dữ liệu (DELETE, UPDATE, INSERT).
     */
    @Modifying
    @Query("DELETE FROM SuggestVocabulary sv WHERE sv.lesson.id = :lessonId")
    void deleteAllByLessonId(@Param("lessonId") Integer lessonId);
} 
