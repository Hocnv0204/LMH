package com.lmh.web.dto.response.stats;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class TopUserStatsResponse {
    private Integer userId;
    private String username;
    private long submissionCount;
}