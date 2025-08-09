package com.lmh.web.service.user;

import com.lmh.web.common.exception.DataExistedException;
import com.lmh.web.common.exception.NotFoundException;
import com.lmh.web.dto.request.user.AdminUpdateUserRequest;
import com.lmh.web.dto.response.user.AdminUserDetailResponse;
import com.lmh.web.dto.response.user.AdminUserSummaryResponse;
import com.lmh.web.model.User;
import com.lmh.web.repository.UserRepository;
import com.lmh.web.utils.mapper.user.UserMapper;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminUserServiceImpl implements AdminUserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

//    @Override
//    public Page<AdminUserSummaryResponse> getAllUsersForAdmin(String searchTerm, String role, Boolean isDeleted, int page, int size, String sortBy, String sortDir) {
//        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
//        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
//
//        Specification<User> spec = (root, query, cb) -> {
//            List<Predicate> predicates = new ArrayList<>();
//
//            if (StringUtils.hasText(searchTerm)) {
//                String likePattern = "%" + searchTerm.toLowerCase() + "%";
//                Predicate namePredicate = cb.like(cb.lower(root.get("name")), likePattern);
//                Predicate usernamePredicate = cb.like(cb.lower(root.get("username")), likePattern);
//                Predicate emailPredicate = cb.like(cb.lower(root.get("email")), likePattern);
//                predicates.add(cb.or(namePredicate, usernamePredicate, emailPredicate));
//            }
//
//            if (StringUtils.hasText(role)) {
//                predicates.add(cb.equal(cb.lower(root.get("role")), role.toLowerCase()));
//            }
//
//            if (isDeleted != null) {
//                predicates.add(cb.equal(root.get("deleteFlag"), isDeleted));
//            }
//
//            return cb.and(predicates.toArray(new Predicate[0]));
//        };
//
//        Page<User> userPage = userRepository.findAll(spec, pageable);
//        return userPage.map(userMapper::toAdminSummaryResponse);
//    }

    @Override
    public Page<AdminUserSummaryResponse> getAllUsersForAdmin(String searchTerm, String role, Boolean isDeleted, int page, int size, String sortBy, String sortDir) {
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        String processedSearchTerm = "%" + (searchTerm == null ? "" : searchTerm.toLowerCase()) + "%";
        String processedRole = (role == null ? null : role.toLowerCase());

        return userRepository.findUserSummaries(processedSearchTerm, processedRole, isDeleted, pageable);
    }

    @Override
    public AdminUserDetailResponse getUserDetailsForAdmin(Integer userId) {
        // 1. Gọi phương thức mới để lấy user cùng các collection liên quan trong 1 query
        User user = userRepository.findByIdWithDetails(userId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng với ID: " + userId));

        // 2. Chuyển đổi các trường cơ bản từ User sang DTO
        AdminUserDetailResponse response = userMapper.toAdminDetailResponse(user);

        // 3. Đặt các giá trị count thủ công từ các collection đã được fetch
        response.setTopicCount(user.getTopics() != null ? (long) user.getTopics().size() : 0L);
        response.setLessonCount(user.getLessons() != null ? (long) user.getLessons().size() : 0L);

        return response;
    }

    @Override
    public void updateUserForAdmin(Integer userId, AdminUpdateUserRequest request) {
        // Bước 1: Vẫn cần tìm user để đảm bảo user tồn tại
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng với ID: " + userId));

        // Bước 2: Chỉ cập nhật các trường được cung cấp trong request
        // Điều này cho phép bạn chỉ gửi role, hoặc chỉ credit, hoặc cả hai
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }
        if (request.getCredit() != null) {
            user.setCredit(request.getCredit());
        }

        // Bước 3: Lưu lại user đã được cập nhật
        userRepository.save(user);

        // Không cần return gì cả, tiết kiệm được 1 câu query chi tiết
    }

    @Override
    public void deleteUserForAdmin(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng với ID: " + userId));
        user.setDeleteFlag(true);
        userRepository.save(user);
    }

    @Override
    public void restoreUserForAdmin(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng với ID: " + userId));
        user.setDeleteFlag(false);
        userRepository.save(user);
    }
}