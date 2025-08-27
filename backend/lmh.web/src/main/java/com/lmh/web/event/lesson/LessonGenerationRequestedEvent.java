package com.lmh.web.event.lesson;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class LessonGenerationRequestedEvent extends ApplicationEvent {

    private final Integer lessonId;
    private final Integer userId;
    private final String topicDescription;
    private final String levelName;
    private final String description;
    private final String languageCode;

    /**
     * Tạo một sự kiện mới.
     * @param source Đối tượng nguồn của sự kiện (thường là 'this' trong service).
     * @param lessonId ID của bài học đã được tạo placeholder.
     * @param userId ID của user
     * @param topicDescription Description của chủ đề.
     * @param levelName Tên của trình độ.
     * @param description Mô tả chi tiết từ admin.
     */
    public LessonGenerationRequestedEvent(Object source, Integer lessonId, Integer userId, String topicDescription, String levelName, String description, String languageCode) {
        super(source);
        this.lessonId = lessonId;
        this.userId = userId;
        this.topicDescription = topicDescription;
        this.levelName = levelName;
        this.description = description;
        this.languageCode = languageCode;
    }
}