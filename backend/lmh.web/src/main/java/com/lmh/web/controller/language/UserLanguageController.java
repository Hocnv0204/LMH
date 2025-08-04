package com.lmh.web.controller.language;

import com.lmh.web.dto.response.CustomResponse;
import com.lmh.web.service.LanguageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user/languages")
@RequiredArgsConstructor
public class UserLanguageController {
    private final LanguageService languageService;

    @GetMapping()
    public CustomResponse<?> getListLanguage(){
        return new CustomResponse<>(languageService.getLanguages(), HttpStatus.OK);
    }
}
