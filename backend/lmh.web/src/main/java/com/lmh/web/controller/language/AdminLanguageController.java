package com.lmh.web.controller.language;

import com.lmh.web.dto.request.language.AdminCreateLanguageRequest;
import com.lmh.web.dto.request.language.AdminUpdateLanguageRequest;
import com.lmh.web.dto.response.CustomResponse;
import com.lmh.web.dto.response.language.AdminLanguageResponse;
import com.lmh.web.service.language.AdminLanguageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/languages")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminLanguageController {

    private final AdminLanguageService adminLanguageService;

    // READ - Lấy danh sách (phân trang, tìm kiếm, lọc)
    @GetMapping
    public CustomResponse<Page<AdminLanguageResponse>> getAllLanguages(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) Boolean isDeleted,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir
    ) {
        Page<AdminLanguageResponse> languagePage = adminLanguageService.getAllLanguagesForAdmin(
                searchTerm, isDeleted, page, size, sortBy, sortDir
        );
        return new CustomResponse<>(languagePage, HttpStatus.OK);
    }

    // READ - Lấy chi tiết một ngôn ngữ
    @GetMapping("/{languageId}")
    public CustomResponse<AdminLanguageResponse> getLanguageById(@PathVariable Integer languageId) {
        AdminLanguageResponse language = adminLanguageService.getLanguageByIdForAdmin(languageId);
        return new CustomResponse<>(language, HttpStatus.OK);
    }

    // CREATE - Tạo ngôn ngữ mới
    @PostMapping
    public CustomResponse<AdminLanguageResponse> createLanguage(@Valid @RequestBody AdminCreateLanguageRequest request) {
        AdminLanguageResponse newLanguage = adminLanguageService.createLanguageForAdmin(request);
        return new CustomResponse<>(newLanguage, HttpStatus.CREATED);
    }

    // UPDATE - Cập nhật ngôn ngữ
    @PutMapping("/{languageId}")
    public CustomResponse<AdminLanguageResponse> updateLanguage(
            @PathVariable Integer languageId,
            @Valid @RequestBody AdminUpdateLanguageRequest request
    ) {
        AdminLanguageResponse updatedLanguage = adminLanguageService.updateLanguageForAdmin(languageId, request);
        return new CustomResponse<>(updatedLanguage, HttpStatus.OK);
    }

    // DELETE - Xóa mềm ngôn ngữ
    @DeleteMapping("/{languageId}")
    public CustomResponse<String> deleteLanguage(@PathVariable Integer languageId) {
        adminLanguageService.deleteLanguageForAdmin(languageId);
        return new CustomResponse<>("Xóa ngôn ngữ thành công", HttpStatus.OK);
    }

    // RESTORE - Khôi phục ngôn ngữ đã xóa
    @PutMapping("/{languageId}/restore")
    public CustomResponse<String> restoreLanguage(@PathVariable Integer languageId) {
        adminLanguageService.restoreLanguageForAdmin(languageId);
        return new CustomResponse<>("Khôi phục ngôn ngữ thành công", HttpStatus.OK);
    }
}