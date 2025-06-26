package com.lmh.web.service.impl;

import com.lmh.web.common.exception.NotFoundException;
import com.lmh.web.dto.response.level.LevelResponse;
import com.lmh.web.model.Level;
import com.lmh.web.repository.LevelRepository;
import com.lmh.web.service.LevelService;
import com.lmh.web.utils.mapper.level.LevelMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LevelServiceImpl implements LevelService {
    private final LevelRepository levelRepository;

    private final LevelMapper levelMapper;

    public List<LevelResponse> getLevelsByLanguage(String languageName){
        return levelMapper.toResponseList(levelRepository.getLevelByLanguageNameAndDeleteFlagFalse(languageName));
    }

    public Level findByName(String name){
        Optional<Level> levelOptional = levelRepository.findByName(name);
        if (levelOptional.isEmpty()){
            throw new NotFoundException("Not found level - " + name);
        }
        return levelOptional.get();
    }

}
