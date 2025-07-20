package com.lmh.web.dto.request.topic;

import com.lmh.web.dto.request.language.LanguageRequest;
import lombok.Getter;
import lombok.Setter;

// Không cần các annotation validation như @NotBlank ở đây
// vì admin có thể chỉ muốn cập nhật một vài trường.
@Getter
@Setter
public class AdminUpdateTopicRequest {

    private String name;
    private String description;
    private String note;
    private LanguageRequest languageRequest;

}
