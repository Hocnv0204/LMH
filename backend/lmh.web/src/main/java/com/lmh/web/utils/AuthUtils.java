package com.lmh.web.utils;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;

/**
 * Lớp tiện ích chứa các phương thức liên quan đến xác thực và người dùng.
 */
public final class AuthUtils {

    /**
     * Lớp tiện ích không nên được khởi tạo.
     */
    private AuthUtils() {}

    /**
     * Trích xuất ID người dùng từ đối tượng Authentication và trả về dưới dạng Integer.
     *
     * @param authentication Đối tượng Authentication được inject bởi Spring Security.
     * @return ID người dùng dưới dạng Integer.
     * @throws IllegalStateException Nếu không tìm thấy thông tin xác thực hoặc token không hợp lệ.
     * @throws IllegalArgumentException Nếu ID người dùng trong token quá lớn để vừa với Integer.
     */
    public static Integer getUserIdAsInteger(Authentication authentication) {
        // 1. Kiểm tra xem đối tượng authentication có hợp lệ không
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("Không tìm thấy thông tin xác thực hợp lệ.");
        }

        // 2. Lấy principal và kiểm tra xem nó có phải là một JWT không
        Object principal = authentication.getPrincipal();
        if (!(principal instanceof Jwt)) {
            throw new IllegalStateException("Principal không phải là một đối tượng JWT hợp lệ.");
        }

        Jwt jwtPrincipal = (Jwt) principal;

        // 3. Lấy claim "id" dưới dạng Long
        Long userIdLong = jwtPrincipal.getClaim("id");
        if (userIdLong == null) {
            throw new IllegalStateException("Token JWT không chứa claim 'id'.");
        }

        // 4. Chuyển đổi an toàn từ Long sang Integer
        try {
            return Math.toIntExact(userIdLong);
        } catch (ArithmeticException e) {
            // Ném ra ngoại lệ nếu giá trị Long quá lớn
            throw new IllegalArgumentException("User ID trong token quá lớn để chuyển thành Integer.", e);
        }
    }
}