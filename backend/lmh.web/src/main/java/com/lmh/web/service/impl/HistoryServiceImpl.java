package com.lmh.web.service.impl;

import com.lmh.web.common.exception.NotFoundException;
import com.lmh.web.common.utils.PageableUtils;
import com.lmh.web.dto.response.history.HistoryResponse;
import com.lmh.web.model.History;
import com.lmh.web.model.Lesson;
import com.lmh.web.model.User;
import com.lmh.web.repository.HistoryRepository;
import com.lmh.web.service.HistoryService;
import com.lmh.web.service.LessonService;
import com.lmh.web.service.UserService;
import com.lmh.web.utils.mapper.history.HistoryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class HistoryServiceImpl implements HistoryService {
    private final HistoryRepository historyRepository;

    private final UserService userService;

    private final HistoryMapper historyMapper;

    private final LessonService lessonService;

    @Override
    public Page<HistoryResponse> getListHistoryByUserAndLesson(String username, Integer lessonId, int size, int page, String sortBy) {
        Pageable pageable = PageableUtils.createPageable(size, page, sortBy);
        User user = userService.getUserByUsername(username);
        Lesson lesson = lessonService.findLessonById(lessonId);
        Page<History> historyPage = historyRepository.findByUserAndLesson(user, lesson, pageable);
        return mapToPageResponse(historyPage);
    }

    @Override
    public HistoryResponse getDetailHistory(Integer id) {
        Optional<History> history = historyRepository.findById(id);
        if (history.isEmpty()){
            throw new NotFoundException("Not found history - " + id);
        }
        return historyMapper.toResponse(history.get());
    }

    public Page<HistoryResponse> mapToPageResponse(Page<History> historyPage) {
        List<HistoryResponse> content = historyMapper.toResponseList(historyPage.getContent());
        return new PageImpl<>(content, historyPage.getPageable(), historyPage.getTotalElements());
    }
}
