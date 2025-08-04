package com.lmh.web.service;

import com.lmh.web.dto.request.lesson.LessonRequest;
import com.lmh.web.dto.request.lesson.UpdateLessonUser;
import com.lmh.web.dto.response.lesson.LessonResponse;
import com.lmh.web.model.Lesson;
import org.springframework.data.domain.Page;

public interface LessonService {
    Page<LessonResponse> getLessonByUserLanguageLevelTopic(Integer userId, String levelName
            , String languageName, String topicName, int size, int page, String sortBy);
    LessonResponse addLessonUser(String username, LessonRequest lessonRequest);
    void deleteLessonUser(String username, String lessonName);
    LessonResponse updateLessonUser(String username, UpdateLessonUser updateLessonUser);
    Lesson findByName(String lessonName);
    LessonResponse findById(Integer lessonId);
    Lesson findLessonById(Integer lessonId);
} 