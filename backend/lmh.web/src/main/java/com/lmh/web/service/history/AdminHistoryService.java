package com.lmh.web.service.history;

import com.lmh.web.dto.response.history.AdminHistoryResponse;
import com.lmh.web.dto.response.stats.TopLessonStatsResponse;
import com.lmh.web.dto.response.stats.TopUserStatsResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface AdminHistoryService {

    Page<AdminHistoryResponse> getHistoryForCurrentDay(Pageable pageable);
    Page<AdminHistoryResponse> getHistoryForCurrentWeek(Pageable pageable);
    Page<AdminHistoryResponse> getHistoryForCurrentMonth(Pageable pageable);

    List<TopLessonStatsResponse> getTopLessonsForCurrentDay();
    List<TopLessonStatsResponse> getTopLessonsForCurrentWeek();

    List<TopUserStatsResponse> getTopUsersForCurrentDay();
    List<TopUserStatsResponse> getTopUsersForCurrentWeek();
}
