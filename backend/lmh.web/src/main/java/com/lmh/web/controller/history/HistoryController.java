package com.lmh.web.controller.history;

import com.lmh.web.dto.response.CustomResponse;
import com.lmh.web.service.HistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class HistoryController {
    private final HistoryService historyService;

    @GetMapping("/user/histories/{username}/{lessonId}")
    public CustomResponse<?> getListHistoryByUser(@RequestParam(defaultValue = "10") int size,
                                                  @RequestParam(defaultValue = "0") int page,
                                                  @RequestParam(defaultValue = "id") String sortBy,
                                                  @PathVariable String username,
                                                  @PathVariable Integer lessonId){
        return new CustomResponse<>(historyService.getListHistoryByUserAndLesson(username, lessonId, size, page, sortBy), HttpStatus.OK);
    }

    @GetMapping("/user/histories/detail/{id}")
    public CustomResponse<?> getDetailHistory(@PathVariable Integer id){
        return new CustomResponse<>(historyService.getDetailHistory(id), HttpStatus.OK);
    }
}
