package com.lmh.web.service.level;

import com.lmh.web.dto.response.level.LevelResponse;
import com.lmh.web.model.Level;

import java.util.List;

public interface LevelService {
    List<LevelResponse> getLevelsByLanguage(String languageName);
    Level findByName(String name);
}
