package com.lmh.web.service.sse;

import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

public interface SseService {

    /**
     * Tạo và đăng ký một SseEmitter mới cho một người dùng.
     * @param userId ID của người dùng để liên kết với emitter.
     * @return SseEmitter đã được tạo.
     */
    SseEmitter createEmitter(Integer userId);

    /**
     * Gửi một sự kiện đến một người dùng cụ thể.
     * @param userId ID của người dùng nhận.
     * @param eventName Tên của sự kiện (frontend sẽ lắng nghe theo tên này).
     * @param data Dữ liệu cần gửi (sẽ được chuyển thành JSON).
     */
    void sendToUser(Integer userId, String eventName, Object data);

    /**
     * Xóa emitter của một người dùng.
     * @param userId ID của người dùng.
     */
    void removeEmitter(Integer userId);
}