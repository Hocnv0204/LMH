package com.lmh.web.service.impl;

import com.lmh.web.common.exception.NotFoundException;
import com.lmh.web.model.Language;
import com.lmh.web.repository.LanguageRepository;
import com.lmh.web.service.LanguageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LanguageServiceImpl implements LanguageService {
    private final LanguageRepository languageRepository;

    @Override
    public Language findByName(String name) {
        Optional<Language> languageOptional = languageRepository.findByName(name);
        if (languageOptional.isEmpty()){
            throw new NotFoundException("Not found language - " + name);
        }
        return languageOptional.get();
    }
}
