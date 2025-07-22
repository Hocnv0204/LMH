package com.lmh.web.dto.response.user;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
public class AdminUserDetailResponse {
    private Integer id;
    private String name;
    private String username;
    private String email;
    private String phoneNumber;
    private LocalDate dateOfBirth;
    private String school;
    private String role;
    private Integer point;
    private Integer credit;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
    private Boolean deleteFlag;
    // Đếm số lượng các thực thể liên quan, rất hữu ích cho admin
    private long topicCount;
    private long lessonCount;
}