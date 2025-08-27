package com.lmh.web.service.user;

import com.lmh.web.dto.request.user.UpdateApiConfigRequest;
import com.lmh.web.dto.request.user.UpdateProfileRequest;
import com.lmh.web.dto.response.history.HistoryResponse;
import com.lmh.web.dto.response.user.UserProfileResponse;
import com.lmh.web.model.User;
import com.lmh.web.repository.HistoryRepository;
import com.lmh.web.repository.UserRepository;
// Giả sử bạn có một exception tùy chỉnh cho trường hợp không tìm thấy user
import com.lmh.web.common.exception.NotFoundException;
import com.lmh.web.utils.mapper.history.HistoryMapper;
import com.lmh.web.utils.mapper.user.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserProfileServiceImpl implements UserProfileService {

    private final UserRepository userRepository;
    private final HistoryRepository historyRepository;
    private final UserMapper userMapper;
    private final HistoryMapper historyMapper;

    // Helper method để lấy user hoặc ném exception nếu không tìm thấy
    private User findUserById(int userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng với ID: " + userId));
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getUserProfileById(int userId) {
        User user = findUserById(userId);
        return userMapper.toUserProfileResponse(user);
    }

    @Override
    @Transactional
    public UserProfileResponse updateUserProfile(int userId, UpdateProfileRequest request) {
        User userToUpdate = findUserById(userId);
        userMapper.updateProfileFromRequest(request, userToUpdate);
        User updatedUser = userRepository.save(userToUpdate);
        return userMapper.toUserProfileResponse(updatedUser);
    }

    @Override
    @Transactional
    public UserProfileResponse updateUserApiConfig(int userId, UpdateApiConfigRequest request) {
        User userToUpdate = findUserById(userId);
        userMapper.updateApiConfigFromRequest(request, userToUpdate);
        User updatedUser = userRepository.save(userToUpdate);
        return userMapper.toUserProfileResponse(updatedUser);
    }

    @Override
    @Transactional(readOnly = true)
    // THAY ĐỔI: Nhận các tham số tường minh thay vì Pageable
    public Page<HistoryResponse> getHistoryForUser(int userId, int page, int size, String sortBy, String sortDir) {
        if (!userRepository.existsById(userId)) {
            throw new NotFoundException("Không tìm thấy người dùng với ID: " + userId);
        }

        // Bước 1: Tạo đối tượng Sort từ sortBy và sortDir
        Sort.Direction direction = sortDir.equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Sort sort = Sort.by(direction, sortBy);

        // Bước 2: Tạo đối tượng Pageable (cụ thể là PageRequest) từ thông tin trang, kích thước và sắp xếp
        Pageable pageable = PageRequest.of(page, size, sort);

        // Bước 3: Gọi repository với đối tượng Pageable vừa tạo (giống như cũ)
        return historyRepository.findByUserId(userId, pageable)
                .map(historyMapper::toResponse);
    }
}