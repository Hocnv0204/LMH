package com.lmh.web.service;

import com.lmh.web.dto.VocabularyDTO;
import com.lmh.web.dto.request.vocab.CreateVocabularyRequest;
import com.lmh.web.dto.request.vocab.GetListVocabRequest;
import com.lmh.web.dto.request.vocab.UpdateVocabularyRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface VocabService {
    VocabularyDTO createVocab(CreateVocabularyRequest request , MultipartFile image );
    VocabularyDTO updateVocab(UpdateVocabularyRequest request , Integer id , MultipartFile image ) throws Exception;
    void deleteVocab(Integer id ) ;
    VocabularyDTO getVocab(Integer id) ;
    Page<VocabularyDTO> getListVocab(Integer userId , Pageable pageable) ;
    List<VocabularyDTO> findByCollection(Integer collectionId) ;
}
