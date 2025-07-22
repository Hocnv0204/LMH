package com.lmh.web.dto.request.authentication;

import com.lmh.web.common.constant.TypeToken;
import lombok.Data;

@Data
public class ResendTokenRequest {
    private String email ;
    private TypeToken typeToken ;
}
