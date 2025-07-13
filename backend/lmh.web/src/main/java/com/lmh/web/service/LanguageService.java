package com.lmh.web.service;

import com.lmh.web.model.Language;

public interface LanguageService {
    Language findByName(String name);
}
