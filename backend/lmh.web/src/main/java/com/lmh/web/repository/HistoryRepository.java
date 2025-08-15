package com.lmh.web.repository;

import com.lmh.web.dto.response.stats.TopLessonStatsResponse;
import com.lmh.web.dto.response.stats.TopUserStatsResponse;
import com.lmh.web.model.History;
import com.lmh.web.model.Lesson;
import com.lmh.web.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface HistoryRepository extends JpaRepository<History, String> {
    Page<History> findByUserAndLesson(User user, Lesson lesson, Pageable pageable);
    Optional<History> findById(Integer id);

    // Lấy danh sách trong một khoảng thời gian có phân trang
    Page<History> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end, Pageable pageable);

    // Thống kê top bài học trong một khoảng thời gian
    @Query("SELECT new com.lmh.web.dto.response.stats.TopLessonStatsResponse(h.lesson.id, h.lesson.name, COUNT(h.id)) " +
           "FROM History h " +
           "WHERE h.createdAt >= :start AND h.createdAt < :end " +
           "GROUP BY h.lesson.id, h.lesson.name " +
           "ORDER BY COUNT(h.id) DESC")
    List<TopLessonStatsResponse> findTopLessonsByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end, Pageable pageable);

    // Thống kê top người dùng trong một khoảng thời gian
    @Query("SELECT new com.lmh.web.dto.response.stats.TopUserStatsResponse(h.user.id, h.user.username, COUNT(h.id)) " +
           "FROM History h " +
           "WHERE h.createdAt >= :start AND h.createdAt < :end " +
           "GROUP BY h.user.id, h.user.username " +
           "ORDER BY COUNT(h.id) DESC")
    List<TopUserStatsResponse> findTopUsersByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end, Pageable pageable);

    Page<History> findByUserId(Integer userId, Pageable pageable);
}
