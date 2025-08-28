package com.lmh.web.event.lesson;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class LessonGenerationCompletionEvent extends ApplicationEvent {

    private final Integer userId;
    private final Integer lessonId;
    private final String lessonTitle;
    private final boolean success;
    private final String message;
    private final String errorCode;

    /**
     * Constructor cho sự kiện hoàn thành.
     * @param source a source object.
     * @param userId ID của người dùng yêu cầu.
     * @param lessonId ID của bài học được tạo/lỗi.
     * @param lessonTitle Tên bài học (nếu thành công).
     * @param success Trạng thái thành công/thất bại.
     * @param message Thông báo.
     */
    public LessonGenerationCompletionEvent(Object source, Integer userId, Integer lessonId, String lessonTitle, boolean success, String message, String errorCode) {
        super(source);
        this.userId = userId;
        this.lessonId = lessonId;
        this.lessonTitle = lessonTitle;
        this.success = success;
        this.message = message;
        this.errorCode = errorCode; // Gán giá trị
    }

    // Tạo constructor cũ để tương thích
    public LessonGenerationCompletionEvent(Object source, Integer userId, Integer lessonId, String lessonTitle, boolean success, String message) {
        this(source, userId, lessonId, lessonTitle, success, message, null);
    }
}