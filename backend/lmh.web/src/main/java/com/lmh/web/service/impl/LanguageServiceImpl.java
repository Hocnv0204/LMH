package com.lmh.web.service.impl;

import com.lmh.web.common.exception.NotFoundException;
import com.lmh.web.common.utils.PageableUtils;
import com.lmh.web.dto.response.language.AllLanguageResponse;
import com.lmh.web.model.Language;
import com.lmh.web.repository.LanguageRepository;
import com.lmh.web.service.LanguageService;
import com.lmh.web.utils.mapper.language.LanguageMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LanguageServiceImpl implements LanguageService {
    private final LanguageRepository languageRepository;

    private final LanguageMapper languageMapper;

    @Override
    public Language findByName(String name) {
        Optional<Language> languageOptional = languageRepository.findByName(name);
        if (languageOptional.isEmpty()){
            throw new NotFoundException("Not found language - " + name);
        }
        return languageOptional.get();
    }

    @Override
    public List<AllLanguageResponse> getLanguages() {
        return languageMapper.toResponseList(languageRepository.findAll());
    }


}
