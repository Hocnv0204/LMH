package com.lmh.web.controller.level;

import com.lmh.web.dto.request.level.AdminCreateLevelRequest;
import com.lmh.web.dto.request.level.AdminUpdateLevelRequest;
import com.lmh.web.dto.response.CustomResponse;
import com.lmh.web.dto.response.level.AdminLevelResponse;
import com.lmh.web.service.level.AdminLevelService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/levels")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminLevelController {

    private final AdminLevelService adminLevelService;

    @GetMapping
    public CustomResponse<Page<AdminLevelResponse>> getAllLevels(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) Integer languageId,
            @RequestParam(required = false) Boolean isDeleted,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDir
    ) {
        Page<AdminLevelResponse> levelPage = adminLevelService.getAllLevelsForAdmin(searchTerm, languageId, isDeleted, page, size, sortBy, sortDir);
        return new CustomResponse<>(levelPage, HttpStatus.OK);
    }

    @GetMapping("/{levelId}")
    public CustomResponse<AdminLevelResponse> getLevelById(@PathVariable Integer levelId) {
        AdminLevelResponse level = adminLevelService.getLevelByIdForAdmin(levelId);
        return new CustomResponse<>(level, HttpStatus.OK);
    }

    @PostMapping
    public CustomResponse<AdminLevelResponse> createLevel(@Valid @RequestBody AdminCreateLevelRequest request) {
        AdminLevelResponse newLevel = adminLevelService.createLevelForAdmin(request);
        return new CustomResponse<>(newLevel, HttpStatus.CREATED);
    }

    @PutMapping("/{levelId}")
    public CustomResponse<AdminLevelResponse> updateLevel(
            @PathVariable Integer levelId,
            @Valid @RequestBody AdminUpdateLevelRequest request
    ) {
        AdminLevelResponse updatedLevel = adminLevelService.updateLevelForAdmin(levelId, request);
        return new CustomResponse<>(updatedLevel, HttpStatus.OK);
    }

    @DeleteMapping("/{levelId}")
    public CustomResponse<String> deleteLevel(@PathVariable Integer levelId) {
        adminLevelService.deleteLevelForAdmin(levelId);
        return new CustomResponse<>("Xoá level thành công", HttpStatus.OK);
    }

    @PutMapping("/{levelId}/restore")
    public CustomResponse<String> restoreLevel(@PathVariable Integer levelId) {
        adminLevelService.restoreLevelForAdmin(levelId);
        return new CustomResponse<>("Khôi phục level thành công", HttpStatus.OK);
    }
}