package com.lmh.web.service;


import com.lmh.web.dto.CollectionVocabDTO;
import com.lmh.web.dto.request.collection.CreateCollectionRequest;
import com.lmh.web.dto.request.collection.UpdateCollectionRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;


import java.util.List;
import java.util.Optional;

public interface CollectionVocabService {
    List<CollectionVocabDTO> findAll();
    CollectionVocabDTO findById(Integer id);
    CollectionVocabDTO createCollection(CreateCollectionRequest request) ;
    CollectionVocabDTO update(Integer id, UpdateCollectionRequest request);
    void deleteById(Integer id);
    boolean existsById(Integer id);
    Page<CollectionVocabDTO> findByUserId(Integer userId , Pageable pageable) ;
}
