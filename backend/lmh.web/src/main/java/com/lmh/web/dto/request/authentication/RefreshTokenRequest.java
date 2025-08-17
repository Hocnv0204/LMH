package com.lmh.web.dto.request.authentication;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RefreshTokenRequest {
    private String refreshToken ;
    private Integer userId ;
}
