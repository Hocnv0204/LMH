package com.lmh.web.dto.response.user;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
@Data
public class UserResponse {
    private Integer id;
    private String name;
    private String username;
    private String email;
    private String phoneNumber;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateOfBirth;
    private String school;
    private Integer point;
    private Integer credit;
    private LocalDateTime createdAt ;
}
