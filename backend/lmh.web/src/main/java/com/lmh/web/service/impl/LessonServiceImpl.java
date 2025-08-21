package com.lmh.web.service.impl;

import com.lmh.web.common.constant.TypeLesson;
import com.lmh.web.common.exception.DataExistedException;
import com.lmh.web.common.exception.InvalidDataException;
import com.lmh.web.common.exception.NotFoundException;
import com.lmh.web.common.utils.PageableUtils;
import com.lmh.web.dto.request.lesson.LessonRequest;
import com.lmh.web.dto.request.lesson.UpdateLessonUser;
import com.lmh.web.dto.response.lesson.LessonResponse;
import com.lmh.web.model.*;
import com.lmh.web.repository.LessonRepository;
import com.lmh.web.service.*;
import com.lmh.web.utils.mapper.lesson.LessonMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class LessonServiceImpl implements LessonService {
    
    private final UserService userService;

    private final TopicService topicService;

    private final LessonRepository lessonRepository;

    private final LessonMapper lessonMapper;

    private final LanguageService languageService;

    private final LevelService levelService;

    @Override
    public Page<LessonResponse> getLessonByUserLanguageLevelTopic(Integer userId, String levelName
            , String languageName, String topicName, int size, int page, String sortBy) {
        log.info("Lấy danh sách bài học cho user ID: {}, level: {}, ngôn ngữ: {}, topic: {}", userId, levelName, languageName, topicName);
        Pageable pageable = PageableUtils.createPageable(size, page, sortBy);
        Page<Lesson> lessonPage = lessonRepository.findLessonsIncludingDefault(
                userId,
                levelName,
                languageName,
                topicName,
                pageable);
        log.info("Lấy danh sách bài học thành công: {} bài học được tìm thấy", lessonPage.getTotalElements());
        return mapToPageResponse(lessonPage);
    }

    @Override
    public LessonResponse addLessonUser(String username, LessonRequest lessonRequest) {
        log.info("Bắt đầu thêm bài học mới: {} cho user: {}", lessonRequest.getName(), username);
        boolean isExistLessonName = lessonRepository.existsByName(lessonRequest.getName());
        if (isExistLessonName) {
            log.warn("Thêm bài học thất bại: Bài học đã tồn tại - {}", lessonRequest.getName());
            throw new DataExistedException("Existed name lesson - " + lessonRequest.getName());
        }

        User user = userService.getUserByUsername(username);
        Topic topic = topicService.findByName(lessonRequest.getTopicName());
        Language language = languageService.findByName(lessonRequest.getLanguageRequest().getName());
        Level level = levelService.findByName(lessonRequest.getLevelRequest().getName());
        
        Lesson lesson = lessonMapper.toEntity(lessonRequest);
        lesson.setTopic(topic);
        lesson.setLanguage(language);
        lesson.setLevel(level);
        lesson.setType(TypeLesson.USER_CREATION);
        lesson.setCreatedAt(LocalDateTime.now());
        lesson.setUpdatedAt(LocalDateTime.now());
        lesson.setStatus("ACTIVE");
        lesson.setUser(user);
        lesson.setDeleteFlag(false);
        
        LessonResponse result = lessonMapper.toResponse(lessonRepository.save(lesson));
        log.info("Thêm bài học thành công: {} cho user: {}, ID: {}", lessonRequest.getName(), username, result.getId());
        return result;
    }

    @Override
    public void deleteLessonUser(String username, String lessonName) {
        log.info("Bắt đầu xóa bài học: {} cho user: {}", lessonName, username);
        Lesson lesson = findByName(lessonName);
        User user = userService.getUserByUsername(username);
        
        if (lesson.getType().equals(TypeLesson.DEFAULT)) {
            log.warn("Xóa bài học thất bại: Không thể xóa bài học mặc định - {}", lessonName);
            throw new InvalidDataException("Cannot delete lesson default");
        }
        
        if (!user.equals(lesson.getUser())) {
            log.warn("Xóa bài học thất bại: Bài học không thuộc về user - {} - lesson: {}", username, lessonName);
            throw new InvalidDataException("Lesson not belong user - " + username + " - lesson name - " + lessonName);
        }
        
        lessonRepository.delete(lesson);
        log.info("Xóa bài học thành công: {} cho user: {}", lessonName, username);
    }

    @Override
    public LessonResponse updateLessonUser(String username, UpdateLessonUser updateLessonUser) {
        log.info("Bắt đầu cập nhật bài học: {} cho user: {}", updateLessonUser.getName(), username);
        Lesson lesson = findByName(updateLessonUser.getName());
        if (lesson.getType().equals(TypeLesson.DEFAULT)){
            log.warn("Cập nhật bài học thất bại: Không thể cập nhật bài học mặc định - {}", updateLessonUser.getName());
            throw new InvalidDataException("Cannot update lesson default");
        }
        User user = userService.getUserByUsername(username);
        
        if (!user.equals(lesson.getUser())) {
            log.warn("Cập nhật bài học thất bại: Bài học không thuộc về user - {} - lesson: {}", username, updateLessonUser.getName());
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
        
        LessonResponse result = lessonMapper.toResponse(lessonRepository.save(lesson));
        log.info("Cập nhật bài học thành công: {} cho user: {}, ID: {}", updateLessonUser.getName(), username, result.getId());
        return result;
    }

    @Override
    public Lesson findByName(String lessonName) {
        log.debug("Tìm kiếm bài học theo tên: {}", lessonName);
        Optional<Lesson> lessonOptional = lessonRepository.findByName(lessonName);
        if (lessonOptional.isEmpty()) {
            log.warn("Không tìm thấy bài học: {}", lessonName);
            throw new NotFoundException("Not found lesson - " + lessonName);
        }
        log.debug("Tìm thấy bài học: {}", lessonName);
        return lessonOptional.get();
    }

    public Lesson findLessonById(Integer lessonId){
        log.debug("Tìm kiếm bài học theo ID: {}", lessonId);
        Optional<Lesson> lessonOptional = lessonRepository.findById(lessonId);
        if (lessonOptional.isEmpty()) {
            log.warn("Không tìm thấy bài học với ID: {}", lessonId);
            throw new NotFoundException("Not found lesson with id - " + lessonId);
        }
        log.debug("Tìm thấy bài học với ID: {}", lessonId);
        return lessonOptional.get();
    }

    @Override
    public LessonResponse findById(Integer lessonId) {
        log.info("Lấy thông tin bài học theo ID: {}", lessonId);
        LessonResponse result = lessonMapper.toResponse(findLessonById(lessonId));
        log.info("Lấy thông tin bài học thành công ID: {}, tên: {}", lessonId, result.getName());
        return result;
    }

    public Page<LessonResponse> mapToPageResponse(Page<Lesson> lessonPage) {
        List<LessonResponse> content = lessonMapper.toResponseList(lessonPage.getContent());
        return new PageImpl<>(content, lessonPage.getPageable(), lessonPage.getTotalElements());
    }
} 
