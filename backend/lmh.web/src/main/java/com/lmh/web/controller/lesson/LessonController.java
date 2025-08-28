package com.lmh.web.controller.lesson;

import com.lmh.web.dto.request.lesson.AdminCreateLessonRequest;
import com.lmh.web.dto.request.lesson.LessonRequest;
import com.lmh.web.dto.request.lesson.UpdateLessonUser;
import com.lmh.web.dto.response.CustomResponse;
import com.lmh.web.dto.response.lesson.LessonGenerationResponse;
import com.lmh.web.dto.response.lesson.LessonResponse;
import com.lmh.web.dto.response.lesson.LessonSummaryResponse;
import com.lmh.web.service.lesson.AdminLessonServiceImpl;
import com.lmh.web.service.lesson.LessonService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/user/lessons") // THAY ĐỔI: Endpoint theo chuẩn RESTful
@Validated
public class LessonController {
    private final LessonService lessonService;

    // THAY ĐỔI: Endpoint lấy danh sách lesson
    @GetMapping
    public CustomResponse<Page<LessonSummaryResponse>> getLessons(
            Authentication authentication, // Spring sẽ tự inject null nếu chưa login
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) Integer topicId,
            @RequestParam(required = false) Integer levelId,
            @RequestParam Integer languageId, // Bắt buộc
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir
    ) {
        Page<LessonSummaryResponse> lessonPage;

        if (authentication != null && authentication.isAuthenticated()) {
            // User đã đăng nhập: Lấy cả default và của riêng user
            Jwt jwtPrincipal = (Jwt) authentication.getPrincipal();
            Long userIdLong = jwtPrincipal.getClaim("id");
            Integer userId;
            try {
                userId = Math.toIntExact(userIdLong);
            } catch (ArithmeticException e) {
                throw new IllegalArgumentException("User ID from token is too large.", e);
            }

            lessonPage = lessonService.getAllLessonsForUser(
                    userId, searchTerm, topicId, levelId, languageId, page, size, sortBy, sortDir
            );
        } else {
            // User chưa đăng nhập (khách): Chỉ lấy lesson default
            lessonPage = lessonService.getDefaultLessons(
                    searchTerm, topicId, levelId, languageId, page, size, sortBy, sortDir
            );
        }

        return new CustomResponse<>(lessonPage, HttpStatus.OK);
    }

    @GetMapping("/my-creations")
    public CustomResponse<Page<LessonSummaryResponse>> getMyCreatedLessons(
            Authentication authentication,
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) Integer topicId,
            @RequestParam(required = false) Integer levelId,
            @RequestParam Integer languageId, // Bắt buộc
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir
    ) {
        Jwt jwtPrincipal = (Jwt) authentication.getPrincipal();
        Long userIdLong = jwtPrincipal.getClaim("id");
        Integer userId;
        try {
            userId = Math.toIntExact(userIdLong);
        } catch (ArithmeticException e) {
            throw new IllegalArgumentException("User ID from token is too large.", e);
        }

        Page<LessonSummaryResponse> lessonPage = lessonService.getCreatedLessonsForUser(
                userId, searchTerm, topicId, levelId, languageId, page, size, sortBy, sortDir
        );

        return new CustomResponse<>(lessonPage, HttpStatus.OK);
    }

    // THAY ĐỔI: Endpoint lấy chi tiết lesson
    @GetMapping("/{lessonId}")
    public CustomResponse<LessonResponse> getLessonDetails(
            @PathVariable Integer lessonId,
            Authentication authentication
    ) {
        Integer userId = null; // Mặc định userId là null (cho người dùng vãng lai)

        // Chỉ lấy userId nếu người dùng đã đăng nhập và được xác thực
        if (authentication != null && authentication.isAuthenticated()) {
            Jwt jwtPrincipal = (Jwt) authentication.getPrincipal();
            Long userIdLong = jwtPrincipal.getClaim("id");
            try {
                userId = Math.toIntExact(userIdLong);
            } catch (ArithmeticException e) {
                // Ghi log lỗi sẽ tốt hơn là chỉ throw exception
                // log.error("User ID from token is too large: {}", userIdLong);
                throw new IllegalArgumentException("User ID from token is too large.", e);
            }
        }

        LessonResponse lesson = lessonService.getLessonDetails(lessonId, userId);
        return new CustomResponse<>(lesson, HttpStatus.OK);
    }

    @PostMapping("/generate-with-ai")
    public CustomResponse<LessonGenerationResponse> createLessonWithAi(
            @Valid @RequestBody AdminCreateLessonRequest request,
            Authentication authentication
    ) {
        Jwt jwtPrincipal = (Jwt) authentication.getPrincipal();
        Long userIdLong = jwtPrincipal.getClaim("id");
        Integer userId;
        try {
            userId = Math.toIntExact(userIdLong);
        } catch (ArithmeticException e) {
            throw new IllegalArgumentException("User ID from token is too large.", e);
        }

        LessonGenerationResponse response = lessonService.requestLessonGeneration(userId, request);
        // Sử dụng HttpStatus.ACCEPTED (202) để chỉ ra rằng yêu cầu đã được chấp nhận
        // nhưng việc xử lý chưa hoàn tất.
        return new CustomResponse<>(response, HttpStatus.ACCEPTED);
    }

    // THAY ĐỔI: Endpoint tạo lesson mới
    @PostMapping
    public CustomResponse<LessonResponse> createLesson(
            Authentication authentication,
            @RequestBody @Validated LessonRequest lessonRequest
    ) {
        Jwt jwtPrincipal = (Jwt) authentication.getPrincipal();
        Long userIdLong = jwtPrincipal.getClaim("id");
        Integer userId;
        try {
            userId = Math.toIntExact(userIdLong);
        } catch (ArithmeticException e) {
            throw new IllegalArgumentException("User ID from token is too large.", e);
        }

        LessonResponse newLesson = lessonService.createLessonForUser(userId, lessonRequest);
        return new CustomResponse<>(newLesson, HttpStatus.CREATED);
    }

    // THAY ĐỔI: Endpoint cập nhật lesson, có @PreAuthorize
    @PutMapping("/{lessonId}")
    @PreAuthorize("@lessonServiceImpl.isOwner(#lessonId, authentication)")
    public CustomResponse<LessonResponse> updateLesson(
            @PathVariable Integer lessonId,
            @RequestBody @Validated UpdateLessonUser updateLessonUser,
            Authentication authentication
    ) {
        LessonResponse updatedLesson = lessonService.updateLessonForUser(lessonId, updateLessonUser);
        return new CustomResponse<>(updatedLesson, HttpStatus.OK);
    }

    // THAY ĐỔI: Endpoint xóa lesson, có @PreAuthorize
    @DeleteMapping("/{lessonId}")
    @PreAuthorize("@lessonServiceImpl.isOwner(#lessonId, authentication)")
    public CustomResponse<String> deleteLesson(
            @PathVariable Integer lessonId,
            Authentication authentication
    ) {
        lessonService.deleteLessonForUser(lessonId);
        return new CustomResponse<>("Lesson deleted successfully", HttpStatus.OK);
    }
}