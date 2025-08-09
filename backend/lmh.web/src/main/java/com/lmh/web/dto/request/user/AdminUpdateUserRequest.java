package com.lmh.web.dto.request.user;

import jakarta.validation.constraints.Email;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class AdminUpdateUserRequest {
    // Chỉ chứa các trường Admin được phép thay đổi
    private String role;
    private Integer credit;
}