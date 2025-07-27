package com.lmh.web.dto.request.language;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminUpdateLanguageRequest {

    private String name; // Cho phép cập nhật tên

    private String languageCode;

    private String note; // Cho phép cập nhật ghi chú
}