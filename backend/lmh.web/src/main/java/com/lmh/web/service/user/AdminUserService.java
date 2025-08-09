package com.lmh.web.service.user;

import com.lmh.web.dto.request.user.AdminUpdateUserRequest;
import com.lmh.web.dto.response.user.AdminUserDetailResponse;
import com.lmh.web.dto.response.user.AdminUserSummaryResponse;
import org.springframework.data.domain.Page;

public interface AdminUserService {

    Page<AdminUserSummaryResponse> getAllUsersForAdmin(
            String searchTerm, String role, Boolean isDeleted,
            int page, int size, String sortBy, String sortDir
    );

    AdminUserDetailResponse getUserDetailsForAdmin(Integer userId);

    void updateUserForAdmin(Integer userId, AdminUpdateUserRequest request);

    void deleteUserForAdmin(Integer userId);

    void restoreUserForAdmin(Integer userId);
}