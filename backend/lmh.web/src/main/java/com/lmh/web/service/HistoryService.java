package com.lmh.web.service;

import com.lmh.web.dto.response.history.HistoryResponse;
import org.springframework.data.domain.Page;

public interface HistoryService {
    Page<HistoryResponse> getListHistoryByUserAndLesson(String username, Integer lessonId, int size, int page, String sortBy);
    HistoryResponse getDetailHistory(Integer id);
}
