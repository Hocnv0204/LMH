package com.lmh.web.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class VocabularyDTO {
    private Integer id;
    private String term;
    private String vi;
    private String type;
    private String pronunciation;
    private String example;
    private String audioUrl;
    private Integer collectionId;
    private Integer userId;
    private String imageUrl ;
    private LocalDateTime createdAt ;
} 