package com.lmh.web.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FlashCardDTO {
    private Integer id ;
    private String term ;
    private String vi ;
    private String imageUrl ;
    private int collectionId ;
    private int userId ;
    private String type ;
}
