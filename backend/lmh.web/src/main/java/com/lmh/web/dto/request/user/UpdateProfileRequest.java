package com.lmh.web.dto.request.user;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class UpdateProfileRequest {

    @Size(min = 2, max = 100, message = "Tên phải có từ 2 đến 100 ký tự")
    private String name;

    private LocalDate dateOfBirth;

    @Size(max = 100, message = "Tên trường không được quá 100 ký tự")
    private String school;
}