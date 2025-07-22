package com.lmh.web.dto.request.authentication;

import lombok.Data;

@Data
public class ResetPasswordRequest {
    private String token ;
    private String newPassword ;
}
