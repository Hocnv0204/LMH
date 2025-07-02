package com.lmh.web.controller;

import com.lmh.web.dto.response.CustomResponse;
import com.lmh.web.dto.response.level.LevelResponse;
import com.lmh.web.model.Level;
import com.lmh.web.service.LevelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RequiredArgsConstructor
@RestController
public class LevelController {
    private final LevelService levelService;

    @GetMapping("/user/level")
    public CustomResponse<?> getLevelByLanguage(@RequestParam String languageName){
        List<LevelResponse> levels = levelService.getLevelsByLanguage(languageName);
        return new CustomResponse<>(levels, HttpStatus.OK);
    }

}
