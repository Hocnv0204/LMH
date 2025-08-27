package com.lmh.web.service.impl;

import com.lmh.web.common.exception.NotFoundException;
import com.lmh.web.common.utils.PageableUtils;
import com.lmh.web.dto.response.history.HistoryResponse;
import com.lmh.web.model.History;
import com.lmh.web.model.Lesson;
import com.lmh.web.model.User;
import com.lmh.web.repository.HistoryRepository;
import com.lmh.web.service.HistoryService;
import com.lmh.web.service.lesson.LessonService;
import com.lmh.web.service.user.UserService;
import com.lmh.web.utils.mapper.history.HistoryMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class HistoryServiceImpl implements HistoryService {
    private final HistoryRepository historyRepository;

    private final UserService userService;

    private final HistoryMapper historyMapper;

    private final LessonService lessonService;

    @Override
    public Page<HistoryResponse> getListHistoryByUserAndLesson(String username, Integer lessonId, int size, int page, String sortBy) {
        log.info("Lấy danh sách lịch sử cho user: {}, lesson ID: {}", username, lessonId);
        Pageable pageable = PageableUtils.createPageable(size, page, sortBy);
        User user = userService.getUserByUsername(username);
        Lesson lesson = lessonService.findById(lessonId);
        Page<History> historyPage = historyRepository.findByUserAndLesson(user, lesson, pageable);
        log.info("Lấy danh sách lịch sử thành công: {} lịch sử được tìm thấy cho user: {}", historyPage.getTotalElements(), username);
        return mapToPageResponse(historyPage);
    }

    @Override
    public HistoryResponse getDetailHistory(Integer id) {
        log.info("Lấy chi tiết lịch sử ID: {}", id);
        Optional<History> history = historyRepository.findById(id);
        if (history.isEmpty()){
            log.warn("Không tìm thấy lịch sử với ID: {}", id);
            throw new NotFoundException("Not found history - " + id);
        }
        log.info("Lấy chi tiết lịch sử thành công ID: {}", id);
        return historyMapper.toResponse(history.get());
    }

    public Page<HistoryResponse> mapToPageResponse(Page<History> historyPage) {
        List<HistoryResponse> content = historyMapper.toResponseList(historyPage.getContent());
        return new PageImpl<>(content, historyPage.getPageable(), historyPage.getTotalElements());
    }
}
