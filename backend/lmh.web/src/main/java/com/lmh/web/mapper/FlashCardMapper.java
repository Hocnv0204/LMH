package com.lmh.web.mapper;

import com.lmh.web.dto.FlashCardDTO;
import com.lmh.web.model.FlashCard;
import org.springframework.stereotype.Component;

@Component
public class FlashCardMapper {
    public FlashCardDTO toDto(FlashCard card){
        return FlashCardDTO.builder()
                .vi(card.getVocabulary().getVi())
                .term(card.getVocabulary().getTerm())
                .id(card.getId())
                .type(card.getVocabulary().getType())
                .collectionId(card.getVocabulary().getCollection().getId())
                .userId(card.getVocabulary().getUser().getId())
                .imageUrl(card.getImageUrl())
                .build() ;
    }
}
