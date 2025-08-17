package com.lmh.web.dto.request.vocab;

import lombok.Data;

@Data
public class CreateVocabularyRequest {
    private String term;
    private String vi;
    private Integer collectionId;
    private Integer userId;
    private boolean forceAdd = false   ;

    public boolean isForceAdd() {
        return forceAdd;
    }
}
