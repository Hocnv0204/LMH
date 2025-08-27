package com.lmh.web.service.lesson;

import com.lmh.web.dto.request.lesson.AdminCreateLessonRequest;
import com.lmh.web.dto.request.lesson.AdminUpdateLessonRequest;
import com.lmh.web.dto.request.suggest.AdminUpdateSuggestVocabularyRequest;
import com.lmh.web.dto.response.lesson.AdminLessonDetailResponse;
import com.lmh.web.dto.response.lesson.AdminLessonSummaryResponse;
import com.lmh.web.dto.response.lesson.LessonGenerationResponse;
import org.springframework.data.domain.Page;

import java.util.List;

public interface AdminLessonService {

    LessonGenerationResponse requestLessonGeneration(Integer userId, AdminCreateLessonRequest request);

    Page<AdminLessonSummaryResponse> getAllLessonsForAdmin(
            String searchTerm, Integer topicId, Integer levelId, Integer languageId, Boolean isDeleted,
            int page, int size, String sortBy, String sortDir
    );

    AdminLessonDetailResponse getLessonDetailsForAdmin(Integer lessonId);

    AdminLessonDetailResponse updateLessonForAdmin(Integer lessonId, AdminUpdateLessonRequest request);

    void updateVocabulariesForLesson(Integer lessonId, List<AdminUpdateSuggestVocabularyRequest> vocabularyRequests);

    void deleteLessonForAdmin(Integer lessonId);

    void restoreLessonForAdmin(Integer lessonId);
}