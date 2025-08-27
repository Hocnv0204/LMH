package com.lmh.web.event.lesson;

import com.lmh.web.event.lesson.LessonGenerationRequestedEvent;
import com.lmh.web.service.gemini.GeminiLessonGeneratorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
@Slf4j
public class LessonGenerationListener {

    private final GeminiLessonGeneratorService generatorService;

    /**
     * Lắng nghe sự kiện LessonGenerationRequestedEvent.
     * Phương thức này sẽ chỉ được thực thi SAU KHI transaction của publisher đã COMMIT thành công.
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleLessonGenerationRequest(LessonGenerationRequestedEvent event) {
        log.info("Received lesson generation request for lessonId: {}. Triggering async process.", event.getLessonId());

        // Gọi service bất đồng bộ với dữ liệu từ sự kiện
        generatorService.generateAndSaveLessonContent(
                event.getLessonId(),
                event.getUserId(),
                event.getTopicDescription(),
                event.getLevelName(),
                event.getDescription(),
                event.getLanguageCode()
        );
    }
}