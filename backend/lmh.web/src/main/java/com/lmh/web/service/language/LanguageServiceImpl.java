package com.lmh.web.service.language;

import com.lmh.web.common.exception.NotFoundException;
import com.lmh.web.dto.response.language.AllLanguageResponse;
import com.lmh.web.model.Language;
import com.lmh.web.repository.LanguageRepository;
import com.lmh.web.utils.mapper.language.LanguageMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class LanguageServiceImpl implements LanguageService {
    private final LanguageRepository languageRepository;

    private final LanguageMapper languageMapper;

    @Override
    public Language findByName(String name) {
        log.debug("Tìm kiếm ngôn ngữ theo tên: {}", name);
        Optional<Language> languageOptional = languageRepository.findByName(name);
        if (languageOptional.isEmpty()){
            log.warn("Không tìm thấy ngôn ngữ: {}", name);
            throw new NotFoundException("Not found language - " + name);
        }
        log.debug("Tìm thấy ngôn ngữ: {}", name);
        return languageOptional.get();
    }

    @Override
    public List<AllLanguageResponse> getLanguages() {
        log.info("Lấy danh sách tất cả ngôn ngữ");
        List<AllLanguageResponse> languages = languageMapper.toResponseList(languageRepository.findAll());
        log.info("Lấy danh sách ngôn ngữ thành công: {} ngôn ngữ được tìm thấy", languages.size());
        return languages;
    }
}
