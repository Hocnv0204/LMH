package com.lmh.web.event.lesson;

import com.lmh.web.service.sse.SseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationListener {

    private final SseService sseService;

    @EventListener
    public void handleLessonGenerationCompletion(LessonGenerationCompletionEvent event) {
        log.info("Handling lesson generation completion event for user: {}", event.getUserId());

        if (event.isSuccess()) {
            // Tạo payload cho thông báo thành công
            Map<String, Object> payload = Map.of(
                    "lessonId", event.getLessonId(),
                    "title", event.getLessonTitle(),
                    "message", event.getMessage()
            );
            sseService.sendToUser(event.getUserId(), "lesson_generation_success", payload);
        } else {
            // Tạo payload cho thông báo thất bại
            Map<String, Object> payload = Map.of(
                    "lessonId", event.getLessonId(),
                    "message", event.getMessage()
            );
            sseService.sendToUser(event.getUserId(), "lesson_generation_failed", payload);
        }
    }
}