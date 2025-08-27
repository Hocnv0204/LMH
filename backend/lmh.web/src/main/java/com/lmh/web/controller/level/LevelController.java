package com.lmh.web.controller.level;

import com.lmh.web.dto.response.CustomResponse;
import com.lmh.web.dto.response.level.LevelResponse;
import com.lmh.web.service.level.LevelService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RequiredArgsConstructor
@RestController
public class LevelController {
    private final LevelService levelService;

    @GetMapping("/user/levels")
    public CustomResponse<List<LevelResponse>> getLevelByLanguage(@RequestParam String languageName){
        List<LevelResponse> levels = levelService.getLevelsByLanguage(languageName);
        return new CustomResponse<>(levels, HttpStatus.OK);
    }

}
