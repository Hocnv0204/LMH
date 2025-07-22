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

    @Override
    public Page<AdminUserSummaryResponse> getAllUsersForAdmin(String searchTerm, String role, Boolean isDeleted, int page, int size, String sortBy, String sortDir) {
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Specification<User> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(searchTerm)) {
                String likePattern = "%" + searchTerm.toLowerCase() + "%";
                Predicate namePredicate = cb.like(cb.lower(root.get("name")), likePattern);
                Predicate usernamePredicate = cb.like(cb.lower(root.get("username")), likePattern);
                Predicate emailPredicate = cb.like(cb.lower(root.get("email")), likePattern);
                predicates.add(cb.or(namePredicate, usernamePredicate, emailPredicate));
            }

            if (StringUtils.hasText(role)) {
                predicates.add(cb.equal(cb.lower(root.get("role")), role.toLowerCase()));
            }

            if (isDeleted != null) {
                predicates.add(cb.equal(root.get("deleteFlag"), isDeleted));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<User> userPage = userRepository.findAll(spec, pageable);
        return userPage.map(userMapper::toAdminSummaryResponse);
    }

    @Override
    public AdminUserDetailResponse getUserDetailsForAdmin(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng với ID: " + userId));
        return userMapper.toAdminDetailResponse(user);
    }

    @Override
    public AdminUserDetailResponse updateUserForAdmin(Integer userId, AdminUpdateUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng với ID: " + userId));

        // Kiểm tra nếu email được thay đổi và đã tồn tại ở user khác
        if (StringUtils.hasText(request.getEmail()) && !request.getEmail().equalsIgnoreCase(user.getEmail())) {
            userRepository.findByEmailIgnoreCase(request.getEmail()).ifPresent(existingUser -> {
                if (!existingUser.getId().equals(userId)) {
                    throw new DataExistedException("Email đã được sử dụng bởi người dùng khác.");
                }
            });
        }

        userMapper.updateEntityFromRequest(request, user);
        User updatedUser = userRepository.save(user);
        return userMapper.toAdminDetailResponse(updatedUser);
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