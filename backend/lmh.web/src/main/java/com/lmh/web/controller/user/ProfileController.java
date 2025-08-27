package com.lmh.web.controller.user;

import com.lmh.web.dto.request.user.UpdateApiConfigRequest;
import com.lmh.web.dto.request.user.UpdateProfileRequest;
import com.lmh.web.dto.response.CustomResponse;
import com.lmh.web.dto.response.history.HistoryResponse;
import com.lmh.web.dto.response.user.UserProfileResponse;
import com.lmh.web.exception.AppException; // Import AppException
import com.lmh.web.exception.ErrorCode;   // Import ErrorCode
import com.lmh.web.service.AuthenticationService; // Import service mới
import com.lmh.web.service.user.UserProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final UserProfileService userProfileService;
    private final AuthenticationService authenticationService;

    /**
     * Helper method để xác thực người dùng.
     * Sẽ ném ra lỗi nếu không hợp lệ.
     */
    private void verifyUser(String authorizationHeader, int userIdFromRequest) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        // Tách lấy phần token
        String token = authorizationHeader.substring(7);

        // Gọi service để xác thực
        boolean isValid = authenticationService.verifyUserIdentity(token, userIdFromRequest);
        if (!isValid) {
            // Nếu không hợp lệ, ném lỗi Unauthorized (401)
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    @GetMapping("/{userId}")
    public CustomResponse<UserProfileResponse> getUserProfileById(
            @PathVariable int userId,
            @RequestHeader("Authorization") String authorizationHeader) {
        verifyUser(authorizationHeader, userId); // Xác thực danh tính
        UserProfileResponse userProfile = userProfileService.getUserProfileById(userId);
        return new CustomResponse<>(userProfile, HttpStatus.OK);
    }

    @PutMapping("/{userId}")
    public CustomResponse<String> updateUserProfile(
            @PathVariable int userId,
            @RequestHeader("Authorization") String authorizationHeader,
            @Valid @RequestBody UpdateProfileRequest request) {
        verifyUser(authorizationHeader, userId); // Xác thực danh tính
        userProfileService.updateUserProfile(userId, request);
        return new CustomResponse<>("Cập nhật thông tin thành công", HttpStatus.OK);
    }

    @PutMapping("/{userId}/api-config")
    public CustomResponse<String> updateUserApiConfig(
            @PathVariable int userId,
            @RequestHeader("Authorization") String authorizationHeader,
            @Valid @RequestBody UpdateApiConfigRequest request) {
        verifyUser(authorizationHeader, userId); // Xác thực danh tính
        userProfileService.updateUserApiConfig(userId, request);
        return new CustomResponse<>("Cập nhật cấu hình API thành công", HttpStatus.OK);
    }

    @GetMapping("/{userId}/history")
    public CustomResponse<Page<HistoryResponse>> getHistoryForUser(
            @PathVariable int userId,
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        verifyUser(authorizationHeader, userId); // Xác thực danh tính
        Page<HistoryResponse> historyPage = userProfileService.getHistoryForUser(userId, page, size, sortBy, sortDir);
        return new CustomResponse<>(historyPage, HttpStatus.OK);
    }
}