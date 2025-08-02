package com.lmh.web.dto.request.authentication;

import lombok.Data;

import java.time.LocalDate;

@Data
public class RegisterRequest {
    private String username ;
    private String password ;
    private String email ;
    private String phoneNumber ;
    private String name ;
    private String school ;
    private LocalDate dateOfBirth ;
}
