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
import com.lmh.web.repository.UserRepository;
import com.lmh.web.service.CollectionVocabService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
    private final UserRepository userRepository;

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
        var user = userRepository.findById(request.getUserId()).orElseThrow(
                () -> new AppException(ErrorCode.USER_NOT_EXISTS)
        ) ;
        if(collectionVocaRepository.existsByNameAndUserId(request.getCollectionName() , request.getUserId())){
            throw new AppException(ErrorCode.COLLECTION_EXISTS) ;
        }
        CollectionVoca collectionVocab = CollectionVoca.builder()
                .name(request.getCollectionName())
                .vocabularies(new ArrayList<>())
                .user(user)
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

    @Override
    public Page<CollectionVocabDTO> findByUserId(Integer userId , Pageable pageable){
        if(!userRepository.existsById(userId)){
            throw new AppException(ErrorCode.USER_NOT_EXISTS) ;
        }
        Page<CollectionVoca> collectionVocaPage = collectionVocaRepository.findCollectionVocaByUserId(userId , pageable) ;
        Page<CollectionVocabDTO> collectionVocabDTOPage = collectionVocaPage.map(collectionMapper::toDto) ;
        return collectionVocabDTOPage ;
    }
}