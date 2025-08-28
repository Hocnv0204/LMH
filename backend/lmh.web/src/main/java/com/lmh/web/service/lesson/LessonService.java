package com.lmh.web.service.lesson;

import com.lmh.web.dto.request.lesson.AdminCreateLessonRequest;
import com.lmh.web.dto.request.lesson.LessonRequest;
import com.lmh.web.dto.request.lesson.UpdateLessonUser;
import com.lmh.web.dto.response.lesson.LessonGenerationResponse;
import com.lmh.web.dto.response.lesson.LessonResponse;
// MỚI: Import DTO mới
import com.lmh.web.dto.response.lesson.LessonSummaryResponse;
import com.lmh.web.model.Lesson;
import org.springframework.data.domain.Page;
// MỚI: Import Authentication
import org.springframework.security.core.Authentication;

public interface LessonService {
    LessonGenerationResponse requestLessonGeneration(Integer userId, AdminCreateLessonRequest request);

    Page<LessonSummaryResponse> getCreatedLessonsForUser(
            Integer userId, String searchTerm, Integer topicId, Integer levelId, Integer languageId,
            int page, int size, String sortBy, String sortDir
    );

    Page<LessonSummaryResponse> getAllLessonsForUser(
            Integer userId, String searchTerm, Integer topicId, Integer levelId, Integer languageId,
            int page, int size, String sortBy, String sortDir
    );

    Page<LessonSummaryResponse> getDefaultLessons(
            String searchTerm, Integer topicId, Integer levelId, Integer languageId,
            int page, int size, String sortBy, String sortDir
    );

    LessonResponse getLessonDetails(Integer lessonId, Integer userId);

    LessonResponse createLessonForUser(Integer userId, LessonRequest lessonRequest);

    LessonResponse updateLessonForUser(Integer lessonId, UpdateLessonUser updateLessonUser);

    void deleteLessonForUser(Integer lessonId);

    boolean isOwner(Integer lessonId, Authentication authentication);

    Lesson findById(Integer lessonId);
}