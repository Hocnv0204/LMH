package com.lmh.web.dto.response.user;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
public class UserProfileResponse {
    private Integer id;
    private String name;
    private String username;
    private String email;
    private String phoneNumber;
    private LocalDate dateOfBirth;
    private String school;
    private Integer point;
    private Integer credit;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
    // User có thể xem API key của chính mình
    private String apiKey;
    private String apiUrl;
}