package com.lmh.web.dto.response.user;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class AdminUserSummaryResponse {
    private Integer id;
    private String username;
    private String email;
    private Integer credit;
    private LocalDateTime createdAt;
    private Boolean deleteFlag;
    // Đếm số lượng các thực thể liên quan, rất hữu ích cho admin
    private long topicCount;
    private long lessonCount;

    public AdminUserSummaryResponse(Integer id, String username, String email, Integer credit, LocalDateTime createdAt, Boolean deleteFlag, long topicCount, long lessonCount) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.credit = credit;
        this.createdAt = createdAt;
        this.deleteFlag = deleteFlag;
        this.topicCount = topicCount;
        this.lessonCount = lessonCount;
    }
}