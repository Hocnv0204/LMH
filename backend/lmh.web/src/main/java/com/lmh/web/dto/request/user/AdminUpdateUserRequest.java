package com.lmh.web.dto.request.user;

import jakarta.validation.constraints.Email;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class AdminUpdateUserRequest {
    private String name;

    @Email(message = "Email không hợp lệ")
    private String email;

    private String phoneNumber;
    private LocalDate dateOfBirth;
    private String school;
    private String role; // Ví dụ: "ADMIN", "USER"
    private Integer point;
    private Integer credit;
}