package com.lmh.web.service.language;

import com.lmh.web.dto.request.language.AdminCreateLanguageRequest;
import com.lmh.web.dto.request.language.AdminUpdateLanguageRequest;
import com.lmh.web.dto.response.language.AdminLanguageResponse;
import org.springframework.data.domain.Page;

public interface AdminLanguageService {

    Page<AdminLanguageResponse> getAllLanguagesForAdmin(
            String searchTerm,
            Boolean isDeleted,
            int page,
            int size,
            String sortBy,
            String sortDir
    );

    AdminLanguageResponse getLanguageByIdForAdmin(Integer languageId);

    AdminLanguageResponse createLanguageForAdmin(AdminCreateLanguageRequest request);

    AdminLanguageResponse updateLanguageForAdmin(Integer languageId, AdminUpdateLanguageRequest request);

    void deleteLanguageForAdmin(Integer languageId);

    void restoreLanguageForAdmin(Integer languageId);
}