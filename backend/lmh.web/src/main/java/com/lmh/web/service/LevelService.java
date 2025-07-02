package com.lmh.web.service;

import com.lmh.web.dto.response.level.LevelResponse;
import com.lmh.web.model.Level;

import java.util.List;

public interface LevelService {
    List<LevelResponse> getLevelsByLanguage(String languageName);
}
