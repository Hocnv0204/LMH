package com.lmh.web.controller.history;

import com.lmh.web.dto.response.CustomResponse;
import com.lmh.web.dto.response.history.AdminHistoryResponse;
import com.lmh.web.dto.response.stats.TopLessonStatsResponse;
import com.lmh.web.dto.response.stats.TopUserStatsResponse;
import com.lmh.web.service.history.AdminHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin/histories")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminHistoryController {

    private final AdminHistoryService adminHistoryService;

    // === API LỌC DANH SÁCH ===

    @GetMapping("/today")
    public CustomResponse<Page<AdminHistoryResponse>> getHistoryForToday(
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return new CustomResponse<>(adminHistoryService.getHistoryForCurrentDay(pageable), HttpStatus.OK);
    }

    @GetMapping("/this-week")
    public CustomResponse<Page<AdminHistoryResponse>> getHistoryForThisWeek(
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return new CustomResponse<>(adminHistoryService.getHistoryForCurrentWeek(pageable), HttpStatus.OK);
    }

    @GetMapping("/this-month")
    public CustomResponse<Page<AdminHistoryResponse>> getHistoryForThisMonth(
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return new CustomResponse<>(adminHistoryService.getHistoryForCurrentMonth(pageable), HttpStatus.OK);
    }

    // === API THỐNG KÊ ===

    @GetMapping("/stats/lessons/top-today")
    public CustomResponse<List<TopLessonStatsResponse>> getTopLessonsToday() {
        return new CustomResponse<>(adminHistoryService.getTopLessonsForCurrentDay(), HttpStatus.OK);
    }

    @GetMapping("/stats/lessons/top-this-week")
    public CustomResponse<List<TopLessonStatsResponse>> getTopLessonsThisWeek() {
        return new CustomResponse<>(adminHistoryService.getTopLessonsForCurrentWeek(), HttpStatus.OK);
    }

    @GetMapping("/stats/users/top-today")
    public CustomResponse<List<TopUserStatsResponse>> getTopUsersToday() {
        return new CustomResponse<>(adminHistoryService.getTopUsersForCurrentDay(), HttpStatus.OK);
    }

    @GetMapping("/stats/users/top-this-week")
    public CustomResponse<List<TopUserStatsResponse>> getTopUsersThisWeek() {
        return new CustomResponse<>(adminHistoryService.getTopUsersForCurrentWeek(), HttpStatus.OK);
    }
}