package com.lmh.web.service.user;

import com.lmh.web.dto.request.user.UpdateApiConfigRequest;
import com.lmh.web.dto.request.user.UpdateProfileRequest;
import com.lmh.web.dto.response.history.HistoryResponse;
import com.lmh.web.dto.response.user.UserProfileResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserProfileService {

    UserProfileResponse getUserProfileById(int userId);

    UserProfileResponse updateUserProfile(int userId, UpdateProfileRequest request);

    UserProfileResponse updateUserApiConfig(int userId, UpdateApiConfigRequest request);

    Page<HistoryResponse> getHistoryForUser(int userId, int page, int size, String sortBy, String sortDir);
}