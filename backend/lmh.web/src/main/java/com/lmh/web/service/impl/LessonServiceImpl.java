package com.lmh.web.service.impl;

import com.lmh.web.common.constant.TypeLesson;
import com.lmh.web.common.exception.DataExistedException;
import com.lmh.web.common.exception.InvalidDataException;
import com.lmh.web.common.exception.NotFoundException;
import com.lmh.web.common.utils.PageableUtils;
import com.lmh.web.dto.request.lesson.LessonRequest;
import com.lmh.web.dto.request.lesson.UpdateLessonUser;
import com.lmh.web.dto.response.lesson.LessonResponse;
import com.lmh.web.model.Lesson;
import com.lmh.web.model.Topic;
import com.lmh.web.model.User;
import com.lmh.web.repository.LessonRepository;
import com.lmh.web.service.LessonService;
import com.lmh.web.service.TopicService;
import com.lmh.web.service.UserService;
import com.lmh.web.utils.mapper.lesson.LessonMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LessonServiceImpl implements LessonService {
    
    private final UserService userService;
    private final TopicService topicService;
    private final LessonRepository lessonRepository;
    private final LessonMapper lessonMapper;

    @Override
    public Page<LessonResponse> getLessonByUserLanguageLevelTopic(LessonRequest lessonRequest, 
                                                                 int size, int page, String sortBy) {
        Pageable pageable = PageableUtils.createPageable(size, page, sortBy);
        Page<Lesson> lessonPage = lessonRepository.findLessonsIncludingDefault(
                lessonRequest.getUserRequest().getId(),
                lessonRequest.getLevelRequest().getName(),
                lessonRequest.getLanguageRequest().getName(),
                lessonRequest.getTopicName(),
                pageable);
        return mapToPageResponse(lessonPage);
    }

    @Override
    public LessonResponse addLessonUser(String username, LessonRequest lessonRequest) {
        User user = userService.getUserByUsername(username);
        Topic topic = topicService.findByName(lessonRequest.getTopicName());
        
        boolean isExistLessonName = lessonRepository.existsByName(lessonRequest.getName());
        if (isExistLessonName) {
            throw new DataExistedException("Existed name lesson - " + lessonRequest.getName());
        }
        
        Lesson lesson = lessonMapper.toEntity(lessonRequest);
        lesson.setTopic(topic);
        lesson.setType(TypeLesson.USER_CREATION);
        lesson.setCreatedAt(LocalDateTime.now());
        lesson.setUpdatedAt(LocalDateTime.now());
        lesson.setStatus("ACTIVE");
        lesson.setUser(user);
        
        return lessonMapper.toResponse(lessonRepository.save(lesson));
    }

    @Override
    public void deleteLessonUser(String username, String lessonName) {
        Lesson lesson = findByName(lessonName);
        User user = userService.getUserByUsername(username);
        
        if (lesson.getType().equals(TypeLesson.DEFAULT)) {
            throw new InvalidDataException("Cannot delete lesson default");
        }
        
        if (!user.equals(lesson.getTopic().getUser())) {
            throw new InvalidDataException("Lesson not belong user - " + username + " - lesson name - " + lessonName);
        }
        
        lessonRepository.delete(lesson);
    }

    @Override
    public LessonResponse updateLessonUser(String username, UpdateLessonUser updateLessonUser) {
        Lesson lesson = findByName(updateLessonUser.getName());
        if (lesson.getType().equals(TypeLesson.DEFAULT)){
            throw new InvalidDataException("Cannot update topic default");
        }
        User user = userService.getUserByUsername(username);
        
        if (!user.equals(lesson.getTopic().getUser())) {
            throw new InvalidDataException("Lesson not belong user - " + username + " - lesson name - " + updateLessonUser.getName());
        }
        
        lesson.setParagraph(updateLessonUser.getParagraph());
        lesson.setNote(updateLessonUser.getNote());
        lesson.setDescription(updateLessonUser.getDescription());
        lesson.setUpdatedAt(LocalDateTime.now());
        
        if (updateLessonUser.getTopicName() != null) {
            Topic topic = topicService.findByName(updateLessonUser.getTopicName());
            lesson.setTopic(topic);
        }
        
        return lessonMapper.toResponse(lessonRepository.save(lesson));
    }

    @Override
    public Lesson findByName(String lessonName) {
        Optional<Lesson> lessonOptional = lessonRepository.findByName(lessonName);
        if (lessonOptional.isEmpty()) {
            throw new NotFoundException("Not found lesson - " + lessonName);
        }
        return lessonOptional.get();
    }

    public Page<LessonResponse> mapToPageResponse(Page<Lesson> lessonPage) {
        List<LessonResponse> content = lessonMapper.toResponseList(lessonPage.getContent());
        return new PageImpl<>(content, lessonPage.getPageable(), lessonPage.getTotalElements());
    }
} 