package com.lmh.web.dto.request.vocab;

import lombok.Data;

@Data
public class UpdateVocabularyRequest {
    private String vi ;
    private String example ;
    private Integer collectionId ;
    private String type ;
}
