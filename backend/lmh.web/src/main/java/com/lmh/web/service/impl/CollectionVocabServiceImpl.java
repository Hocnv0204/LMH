package com.lmh.web.service.impl;


import com.lmh.web.dto.CollectionVocabDTO;
import com.lmh.web.dto.VocabularyDTO;
import com.lmh.web.dto.request.collection.CreateCollectionRequest;
import com.lmh.web.dto.request.collection.UpdateCollectionRequest;
import com.lmh.web.exception.AppException;
import com.lmh.web.exception.ErrorCode;
import com.lmh.web.mapper.CollectionMapper;
import com.lmh.web.mapper.VocabMapper;
import com.lmh.web.model.CollectionVoca;

import com.lmh.web.repository.CollectionVocaRepository;
import com.lmh.web.service.CollectionVocabService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CollectionVocabServiceImpl implements CollectionVocabService {

    private final CollectionVocaRepository collectionVocaRepository;
    private final VocabMapper vocabMapper ;
    private final CollectionMapper collectionMapper ;
    @Override
    public List<CollectionVocabDTO> findAll() {
        return collectionVocaRepository.findAll().stream().map((CollectionVocab) -> collectionMapper.toDto(CollectionVocab)).collect(Collectors.toCollection(ArrayList::new)) ;
    }
    
    @Override
    public CollectionVocabDTO findById(Integer id) {
        CollectionVoca collectionVocab = collectionVocaRepository.findById(id).orElseThrow(
                () -> new AppException(ErrorCode.COLLECTION_IS_NOT_EXISTS)
        ) ;
        return collectionMapper.toDto(collectionVocab) ;
    }

    @Override
    public CollectionVocabDTO createCollection(CreateCollectionRequest request) {
        if(collectionVocaRepository.existsByName(request.getCollectionName())){
            throw new AppException(ErrorCode.COLLECTION_EXISTS) ;
        }
        List<VocabularyDTO> vocabularyDTOList = new ArrayList<>() ;
        CollectionVoca collectionVocab = CollectionVoca.builder()
                .name(request.getCollectionName())
                .vocabularies(new ArrayList<>())
                .build() ;
        collectionVocaRepository.save(collectionVocab) ;
       return collectionMapper.toDto(collectionVocab) ;
    }
    
    @Override
    public CollectionVocabDTO update(Integer id, UpdateCollectionRequest request) {
        CollectionVoca collectionVocab = collectionVocaRepository.findById(id).orElseThrow(
                () -> new AppException(ErrorCode.COLLECTION_IS_NOT_EXISTS)
        )  ;
        collectionVocab.setName(request.getCollectionName());
        CollectionVoca savedCollection = collectionVocaRepository.save(collectionVocab) ;
        return collectionMapper.toDto(savedCollection) ;
    }
    
    @Override
    public void deleteById(Integer id) {
        if (collectionVocaRepository.existsById(id)) {
            collectionVocaRepository.deleteById(id);
        } else {
            throw new RuntimeException("CollectionVocab not found with id: " + id);
        }
    }
    
    @Override
    public boolean existsById(Integer id) {
        return collectionVocaRepository.existsById(id);
    }
}