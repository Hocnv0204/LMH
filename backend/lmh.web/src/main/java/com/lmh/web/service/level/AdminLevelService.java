package com.lmh.web.service.level;

import com.lmh.web.dto.request.level.AdminCreateLevelRequest;
import com.lmh.web.dto.request.level.AdminUpdateLevelRequest;
import com.lmh.web.dto.response.level.AdminLevelResponse;
import org.springframework.data.domain.Page;

public interface AdminLevelService {

    Page<AdminLevelResponse> getAllLevelsForAdmin(String searchTerm, Integer languageId, Boolean isDeleted, int page, int size, String sortBy, String sortDir);

    AdminLevelResponse getLevelByIdForAdmin(Integer levelId);

    AdminLevelResponse createLevelForAdmin(AdminCreateLevelRequest request);

    AdminLevelResponse updateLevelForAdmin(Integer levelId, AdminUpdateLevelRequest request);

    void deleteLevelForAdmin(Integer levelId);

    void restoreLevelForAdmin(Integer levelId);
}