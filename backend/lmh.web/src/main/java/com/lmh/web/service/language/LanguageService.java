package com.lmh.web.service.language;

import com.lmh.web.dto.response.language.AllLanguageResponse;
import com.lmh.web.model.Language;

import java.util.List;

public interface LanguageService {
    Language findByName(String name);
    List<AllLanguageResponse> getLanguages();
}
