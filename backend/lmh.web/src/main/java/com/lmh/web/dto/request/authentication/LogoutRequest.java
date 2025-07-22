package com.lmh.web.dto.request.authentication;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LogoutRequest {
    private String token;
}
