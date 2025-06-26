package com.lmh.web.service;

import com.lmh.web.dto.VocabularyDTO;
import com.lmh.web.dto.request.vocab.CreateVocabularyRequest;
import com.lmh.web.dto.request.vocab.UpdateVocabularyRequest;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface VocabService {
    VocabularyDTO createVocab(CreateVocabularyRequest request , MultipartFile image );
    VocabularyDTO updateVocab(UpdateVocabularyRequest request , Integer id ) ;
    void deleteVocab(Integer id ) ;
    VocabularyDTO getVocab(Integer id) ;
    List<VocabularyDTO> getListVocab() ;
}
