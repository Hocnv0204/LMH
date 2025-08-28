package com.lmh.web.service.sse;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
@RequiredArgsConstructor
public class SseServiceImpl implements SseService {

    // Thời gian timeout cho một kết nối SSE (vd: 30 phút)
    private static final Long SSE_EMITTER_TIMEOUT = 30 * 60 * 1000L;

    // Sử dụng ConcurrentHashMap để lưu trữ các emitters, an toàn cho môi trường đa luồng
    private final Map<Integer, SseEmitter> emitters = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper;

    @Override
    public SseEmitter createEmitter(Integer userId) {
        // Tạo một emitter với thời gian timeout
        SseEmitter emitter = new SseEmitter(SSE_EMITTER_TIMEOUT);

        // Lưu emitter này lại để có thể gửi sự kiện sau này
        emitters.put(userId, emitter);
        log.info("Created SSE emitter for user: {}", userId);

        // Xử lý khi emitter hoàn thành (timeout hoặc lỗi)
        emitter.onCompletion(() -> {
            log.info("SSE emitter completed for user: {}", userId);
            this.removeEmitter(userId);
        });
        emitter.onTimeout(() -> {
            log.info("SSE emitter timed out for user: {}", userId);
            emitter.complete();
        });
        emitter.onError(e -> {
            log.error("SSE emitter error for user: {}: {}", userId, e.getMessage());
            this.removeEmitter(userId);
        });

        // Gửi một sự kiện "connect" ban đầu để xác nhận kết nối thành công
        sendToUser(userId, "connect", "Connection established successfully.");

        return emitter;
    }

    @Override
    public void sendToUser(Integer userId, String eventName, Object data) {
        SseEmitter emitter = emitters.get(userId);
        if (emitter != null) {
            try {
                String jsonData = objectMapper.writeValueAsString(data);
                SseEmitter.SseEventBuilder event = SseEmitter.event()
                        .name(eventName) // Tên sự kiện để frontend phân biệt
                        .data(jsonData);
                emitter.send(event);
                log.info("Sent SSE event '{}' to user: {}", eventName, userId);
            } catch (IOException e) {
                log.error("Failed to send SSE event to user {}: {}", userId, e.getMessage());
                // Lỗi xảy ra, có thể client đã ngắt kết nối -> xóa emitter
                this.removeEmitter(userId);
            }
        } else {
            log.warn("No active SSE emitter found for user: {}", userId);
        }
    }

    @Override
    public void removeEmitter(Integer userId) {
        emitters.remove(userId);
        log.info("Removed SSE emitter for user: {}", userId);
    }
}