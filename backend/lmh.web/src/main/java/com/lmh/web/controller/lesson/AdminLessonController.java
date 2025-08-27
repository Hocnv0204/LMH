package com.lmh.web.controller.lesson;

import com.lmh.web.dto.request.lesson.AdminCreateLessonRequest;
import com.lmh.web.dto.request.lesson.AdminUpdateLessonRequest;
import com.lmh.web.dto.request.suggest.AdminUpdateSuggestVocabularyRequest;
import com.lmh.web.dto.response.CustomResponse;
import com.lmh.web.dto.response.lesson.AdminLessonDetailResponse;
import com.lmh.web.dto.response.lesson.AdminLessonSummaryResponse;
import com.lmh.web.dto.response.lesson.LessonGenerationResponse;
import com.lmh.web.service.lesson.AdminLessonServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import java.util.List;

@RestController
@RequestMapping("/admin/lessons")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminLessonController {

    private final AdminLessonServiceImpl adminLessonService;

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

        LessonGenerationResponse response = adminLessonService.requestLessonGeneration(userId, request);
        // Sử dụng HttpStatus.ACCEPTED (202) để chỉ ra rằng yêu cầu đã được chấp nhận
        // nhưng việc xử lý chưa hoàn tất.
        return new CustomResponse<>(response, HttpStatus.ACCEPTED);
    }

    @GetMapping
    public CustomResponse<Page<AdminLessonSummaryResponse>> getAllLessons(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) Integer topicId,
            @RequestParam(required = false) Integer levelId,
            @RequestParam(required = false) Integer languageId,
            @RequestParam(required = false) Boolean isDeleted,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir
    ) {
        Page<AdminLessonSummaryResponse> lessonPage = adminLessonService.getAllLessonsForAdmin(
                searchTerm, topicId, levelId, languageId, isDeleted, page, size, sortBy, sortDir
        );
        return new CustomResponse<>(lessonPage, HttpStatus.OK);
    }

    @GetMapping("/{lessonId}")
    public CustomResponse<AdminLessonDetailResponse> getLessonDetails(@PathVariable Integer lessonId) {
        AdminLessonDetailResponse lessonDetails = adminLessonService.getLessonDetailsForAdmin(lessonId);
        return new CustomResponse<>(lessonDetails, HttpStatus.OK);
    }

    @PutMapping("/{lessonId}")
    public CustomResponse<AdminLessonDetailResponse> updateLesson(
            @PathVariable Integer lessonId,
            @Valid @RequestBody AdminUpdateLessonRequest request
    ) {
        AdminLessonDetailResponse updatedLesson = adminLessonService.updateLessonForAdmin(lessonId, request);
        return new CustomResponse<>(updatedLesson, HttpStatus.OK);
    }

    @PutMapping("/{lessonId}/vocabularies")
    public CustomResponse<String> updateLessonVocabularies(
            @PathVariable Integer lessonId,
            @Valid @RequestBody List<AdminUpdateSuggestVocabularyRequest> vocabularies
    ) {
        adminLessonService.updateVocabulariesForLesson(lessonId, vocabularies);
        return new CustomResponse<>("Cập nhật từ vựng thành công", HttpStatus.OK);
    }

    @DeleteMapping("/{lessonId}")
    public CustomResponse<String> deleteLesson(@PathVariable Integer lessonId) {
        adminLessonService.deleteLessonForAdmin(lessonId);
        return new CustomResponse<>("Xóa bài học thành công", HttpStatus.OK);
    }

    @PutMapping("/{lessonId}/restore")
    public CustomResponse<String> restoreLesson(@PathVariable Integer lessonId) {
        adminLessonService.restoreLessonForAdmin(lessonId);
        return new CustomResponse<>("Khôi phục bài học thành công", HttpStatus.OK);
    }
}