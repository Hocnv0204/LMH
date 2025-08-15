package com.lmh.web.dto.request.user;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateApiConfigRequest {
    private String apiKey;
    private String apiUrl;
}