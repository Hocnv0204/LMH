package com.lmh.web.service.history;

import com.lmh.web.dto.response.history.AdminHistoryResponse;
import com.lmh.web.dto.response.stats.TopLessonStatsResponse;
import com.lmh.web.dto.response.stats.TopUserStatsResponse;
import com.lmh.web.repository.HistoryRepository;
import com.lmh.web.utils.mapper.history.HistoryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminHistoryServiceImpl implements AdminHistoryService{

    private static final int TOP_LIMIT = 20;

    private final HistoryRepository historyRepository;

    private final HistoryMapper historyMapper;


    @Override
    public Page<AdminHistoryResponse> getHistoryForCurrentDay(Pageable pageable) {
        LocalDateTime start = LocalDate.now().atStartOfDay();
        LocalDateTime end = LocalDate.now().atTime(LocalTime.MAX);
        return historyRepository.findByCreatedAtBetween(start, end, pageable).map(historyMapper::toAdminResponse);
    }

    @Override
    public Page<AdminHistoryResponse> getHistoryForCurrentWeek(Pageable pageable) {
        LocalDate today = LocalDate.now();
        LocalDateTime start = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).atStartOfDay();
        LocalDateTime end = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY)).atTime(LocalTime.MAX);
        return historyRepository.findByCreatedAtBetween(start, end, pageable).map(historyMapper::toAdminResponse);
    }

    @Override
    public Page<AdminHistoryResponse> getHistoryForCurrentMonth(Pageable pageable) {
        LocalDate today = LocalDate.now();
        LocalDateTime start = today.with(TemporalAdjusters.firstDayOfMonth()).atStartOfDay();
        LocalDateTime end = today.with(TemporalAdjusters.lastDayOfMonth()).atTime(LocalTime.MAX);
        return historyRepository.findByCreatedAtBetween(start, end, pageable).map(historyMapper::toAdminResponse);
    }

    @Override
    public List<TopLessonStatsResponse> getTopLessonsForCurrentDay() {
        LocalDateTime start = LocalDate.now().atStartOfDay();
        LocalDateTime end = LocalDate.now().atTime(LocalTime.MAX);
        Pageable top20 = PageRequest.of(0, TOP_LIMIT);
        return historyRepository.findTopLessonsByDateRange(start, end, top20);
    }

    @Override
    public List<TopLessonStatsResponse> getTopLessonsForCurrentWeek() {
        LocalDate today = LocalDate.now();
        LocalDateTime start = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).atStartOfDay();
        LocalDateTime end = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY)).atTime(LocalTime.MAX);
        Pageable top20 = PageRequest.of(0, TOP_LIMIT);
        return historyRepository.findTopLessonsByDateRange(start, end, top20);
    }

    @Override
    public List<TopUserStatsResponse> getTopUsersForCurrentDay() {
        LocalDateTime start = LocalDate.now().atStartOfDay();
        LocalDateTime end = LocalDate.now().atTime(LocalTime.MAX);
        Pageable top20 = PageRequest.of(0, TOP_LIMIT);
        return historyRepository.findTopUsersByDateRange(start, end, top20);
    }

    @Override
    public List<TopUserStatsResponse> getTopUsersForCurrentWeek() {
        LocalDate today = LocalDate.now();
        LocalDateTime start = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).atStartOfDay();
        LocalDateTime end = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY)).atTime(LocalTime.MAX);
        Pageable top20 = PageRequest.of(0, TOP_LIMIT);
        return historyRepository.findTopUsersByDateRange(start, end, top20);
    }
}
