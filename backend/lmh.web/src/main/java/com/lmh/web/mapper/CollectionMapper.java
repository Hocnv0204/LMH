package com.lmh.web.mapper;

import com.lmh.web.dto.CollectionVocabDTO;
import com.lmh.web.model.CollectionVoca;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class CollectionMapper {
    private final VocabMapper vocabMapper ;
    public CollectionVocabDTO toDto(CollectionVoca collectionVocab){
        return CollectionVocabDTO.builder()
                .collectionName(collectionVocab.getName())
                .vocabularyDTOList(collectionVocab.getVocabularies().stream()
                        .map(vocabulary -> vocabMapper.toDto(vocabulary))
                        .collect(Collectors.toCollection(ArrayList::new)))
                .id(collectionVocab.getId())
                .build();
    }
}
