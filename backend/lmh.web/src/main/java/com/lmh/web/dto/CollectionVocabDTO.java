package com.lmh.web.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Builder
@Data
public class CollectionVocabDTO {
    private String collectionName ;
    private List<VocabularyDTO> vocabularyDTOList ;
    private Integer id ;
}
