package com.lmh.web.controller.user;

import com.lmh.web.dto.request.user.AdminUpdateUserRequest;
import com.lmh.web.dto.response.CustomResponse;
import com.lmh.web.dto.response.user.AdminUserDetailResponse;
import com.lmh.web.dto.response.user.AdminUserSummaryResponse;
import com.lmh.web.service.user.AdminUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/users")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public CustomResponse<Page<AdminUserSummaryResponse>> getAllUsers(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Boolean isDeleted,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir
    ) {
        Page<AdminUserSummaryResponse> userPage = adminUserService.getAllUsersForAdmin(
                searchTerm, role, isDeleted, page, size, sortBy, sortDir
        );
        return new CustomResponse<>(userPage, HttpStatus.OK);
    }

    @GetMapping("/{userId}")
    public CustomResponse<AdminUserDetailResponse> getUserDetails(@PathVariable Integer userId) {
        AdminUserDetailResponse userDetails = adminUserService.getUserDetailsForAdmin(userId);
        return new CustomResponse<>(userDetails, HttpStatus.OK);
    }

    @PutMapping("/{userId}")
    public CustomResponse<String> updateUser(
            @PathVariable Integer userId,
            @Valid @RequestBody AdminUpdateUserRequest request
    ) {
        adminUserService.updateUserForAdmin(userId, request);
        return new CustomResponse<>("Cập nhật người dùng thành công", HttpStatus.OK);
    }

    @DeleteMapping("/{userId}")
    public CustomResponse<String> deleteUser(@PathVariable Integer userId) {
        adminUserService.deleteUserForAdmin(userId);
        return new CustomResponse<>("Xóa người dùng thành công", HttpStatus.OK);
    }

    @PutMapping("/{userId}/restore")
    public CustomResponse<String> restoreUser(@PathVariable Integer userId) {
        adminUserService.restoreUserForAdmin(userId);
        return new CustomResponse<>("Khôi phục người dùng thành công", HttpStatus.OK);
    }
}