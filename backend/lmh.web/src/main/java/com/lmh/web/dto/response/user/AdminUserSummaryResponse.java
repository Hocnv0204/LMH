package com.lmh.web.dto.response.user;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class AdminUserSummaryResponse {
    private Integer id;
    private String name;
    private String username;
    private String email;
    private String role;
    private Integer credit;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
    private Boolean deleteFlag;
}