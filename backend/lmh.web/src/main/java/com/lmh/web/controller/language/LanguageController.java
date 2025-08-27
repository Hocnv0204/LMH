package com.lmh.web.controller.language;

import com.lmh.web.dto.response.CustomResponse;
import com.lmh.web.dto.response.language.AllLanguageResponse;
import com.lmh.web.service.language.LanguageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/user/languages")
@RequiredArgsConstructor
public class LanguageController {
    private final LanguageService languageService;

    @GetMapping()
    public CustomResponse<List<AllLanguageResponse>> getListLanguage(){
        return new CustomResponse<>(languageService.getLanguages(), HttpStatus.OK);
    }
}
