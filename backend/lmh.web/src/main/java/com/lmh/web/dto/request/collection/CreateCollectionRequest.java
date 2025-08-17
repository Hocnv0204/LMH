package com.lmh.web.dto.request.collection;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class CreateCollectionRequest {
    private String collectionName ;
    private Integer userId ;
}
