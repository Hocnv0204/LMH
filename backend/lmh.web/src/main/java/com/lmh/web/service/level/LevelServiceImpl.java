package com.lmh.web.service.level;

import com.lmh.web.common.exception.NotFoundException;
import com.lmh.web.dto.response.level.LevelResponse;
import com.lmh.web.model.Level;
import com.lmh.web.repository.LevelRepository;
import com.lmh.web.utils.mapper.level.LevelMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class LevelServiceImpl implements LevelService {
    private final LevelRepository levelRepository;

    private final LevelMapper levelMapper;

    public List<LevelResponse> getLevelsByLanguage(String languageName){
        log.info("Lấy danh sách level cho ngôn ngữ: {}", languageName);
        List<LevelResponse> levels = levelMapper.toResponseList(levelRepository.getLevelByLanguageNameAndDeleteFlagFalse(languageName));
        log.info("Lấy danh sách level thành công: {} level được tìm thấy cho ngôn ngữ: {}", levels.size(), languageName);
        return levels;
    }

    public Level findByName(String name){
        log.debug("Tìm kiếm level theo tên: {}", name);
        Optional<Level> levelOptional = levelRepository.findByName(name);
        if (levelOptional.isEmpty()){
            log.warn("Không tìm thấy level: {}", name);
            throw new NotFoundException("Not found level - " + name);
        }
        log.debug("Tìm thấy level: {}", name);
        return levelOptional.get();
    }
}
