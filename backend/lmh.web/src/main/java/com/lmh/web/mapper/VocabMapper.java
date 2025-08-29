package com.lmh.web.mapper;

import com.lmh.web.dto.VocabularyDTO;
import com.lmh.web.model.Vocabulary;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class VocabMapper {
    public VocabularyDTO toDto(Vocabulary vocab){
        VocabularyDTO dto = VocabularyDTO.builder()
                .id(vocab.getId())
                .vi(vocab.getVi())
                .example(vocab.getExample())
                .collectionId(vocab.getCollection().getId())
                .userId(vocab.getUser().getId())
                .pronunciation(vocab.getPronunciation())
                .term(vocab.getTerm())
                .type(vocab.getType())
                .audioUrl(vocab.getAudioUrl())
                .imageUrl(vocab.getImageUrl())
                .createdAt(vocab.getCreatedAt())
                .build() ;
        return dto ;
    }
    public List<VocabularyDTO> toDto(List<Vocabulary> listVocab){
        return listVocab.stream().map(this::toDto).collect(Collectors.toList()) ;
    }
}
