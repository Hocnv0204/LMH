package com.lmh.web.controller;

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

    @GetMapping("/user/histories/{username}")
    public CustomResponse<?> getListHistoryByUser(@RequestParam(defaultValue = "10") int size,
                                                  @RequestParam(defaultValue = "0") int page,
                                                  @RequestParam(defaultValue = "id") String sortBy,
                                                  @PathVariable String username){
        return new CustomResponse<>(historyService.getListHistoryByUser(username, size, page, sortBy), HttpStatus.OK);
    }

    @GetMapping("/user/histories/{id}")
    public CustomResponse<?> getDetailHistory(@PathVariable Integer id){
        return new CustomResponse<>(historyService.getDetailHistory(id), HttpStatus.OK);
    }
}
