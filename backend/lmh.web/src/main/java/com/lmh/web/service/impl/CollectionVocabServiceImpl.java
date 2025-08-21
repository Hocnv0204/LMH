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
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CollectionVocabServiceImpl implements CollectionVocabService {

    private final CollectionVocaRepository collectionVocaRepository;
    private final VocabMapper vocabMapper ;
    private final CollectionMapper collectionMapper ;
    private final UserRepository userRepository;

    @Override
    public List<CollectionVocabDTO> findAll() {
        log.info("Lấy tất cả collection từ vựng");
        List<CollectionVocabDTO> result = collectionVocaRepository.findAll().stream()
                .map(collectionMapper::toDto)
                .collect(Collectors.toCollection(ArrayList::new));
        log.info("Lấy tất cả collection thành công: {} collection được tìm thấy", result.size());
        return result;
    }
    
    @Override
    public CollectionVocabDTO findById(Integer id) {
        log.info("Lấy collection từ vựng theo ID: {}", id);
        CollectionVoca collectionVocab = collectionVocaRepository.findById(id).orElseThrow(
                () -> {
                    log.warn("Không tìm thấy collection với ID: {}", id);
                    return new AppException(ErrorCode.COLLECTION_IS_NOT_EXISTS);
                }
        );
        log.info("Lấy collection thành công ID: {}, tên: {}", id, collectionVocab.getName());
        return collectionMapper.toDto(collectionVocab);
    }

    @Override
    public CollectionVocabDTO createCollection(CreateCollectionRequest request) {
        log.info("Bắt đầu tạo collection mới: {} cho user ID: {}", request.getCollectionName(), request.getUserId());
        var user = userRepository.findById(request.getUserId()).orElseThrow(
                () -> {
                    log.warn("Tạo collection thất bại: Không tìm thấy user với ID: {}", request.getUserId());
                    return new AppException(ErrorCode.USER_NOT_EXISTS);
                }
        );
        if(collectionVocaRepository.existsByNameAndUserId(request.getCollectionName(), request.getUserId())){
            log.warn("Tạo collection thất bại: Collection đã tồn tại - {} cho user ID: {}", request.getCollectionName(), request.getUserId());
            throw new AppException(ErrorCode.COLLECTION_EXISTS);
        }
        CollectionVoca collectionVocab = CollectionVoca.builder()
                .name(request.getCollectionName())
                .vocabularies(new ArrayList<>())
                .user(user)
                .build();
        CollectionVoca savedCollection = collectionVocaRepository.save(collectionVocab);
        log.info("Tạo collection thành công: {} cho user ID: {}, collection ID: {}", request.getCollectionName(), request.getUserId(), savedCollection.getId());
        return collectionMapper.toDto(savedCollection);
    }
    
    @Override
    public CollectionVocabDTO update(Integer id, UpdateCollectionRequest request) {
        log.info("Bắt đầu cập nhật collection ID: {}, tên mới: {}", id, request.getCollectionName());
        CollectionVoca collectionVocab = collectionVocaRepository.findById(id).orElseThrow(
                () -> {
                    log.warn("Cập nhật collection thất bại: Không tìm thấy collection với ID: {}", id);
                    return new AppException(ErrorCode.COLLECTION_IS_NOT_EXISTS);
                }
        );
        String oldName = collectionVocab.getName();
        collectionVocab.setName(request.getCollectionName());
        CollectionVoca savedCollection = collectionVocaRepository.save(collectionVocab);
        log.info("Cập nhật collection thành công ID: {}, tên cũ: {} -> tên mới: {}", id, oldName, request.getCollectionName());
        return collectionMapper.toDto(savedCollection);
    }
    
    @Override
    public void deleteById(Integer id) {
        log.info("Bắt đầu xóa collection ID: {}", id);
        if (collectionVocaRepository.existsById(id)) {
            collectionVocaRepository.deleteById(id);
            log.info("Xóa collection thành công ID: {}", id);
        } else {
            log.warn("Xóa collection thất bại: Không tìm thấy collection với ID: {}", id);
            throw new RuntimeException("CollectionVocab not found with id: " + id);
        }
    }
    
    @Override
    public boolean existsById(Integer id) {
        log.debug("Kiểm tra tồn tại collection ID: {}", id);
        boolean exists = collectionVocaRepository.existsById(id);
        log.debug("Collection ID: {} tồn tại: {}", id, exists);
        return exists;
    }

    @Override
    public Page<CollectionVocabDTO> findByUserId(Integer userId, Pageable pageable){
        log.info("Lấy danh sách collection cho user ID: {}", userId);
        if(!userRepository.existsById(userId)){
            log.warn("Lấy collection thất bại: Không tìm thấy user với ID: {}", userId);
            throw new AppException(ErrorCode.USER_NOT_EXISTS);
        }
        Page<CollectionVoca> collectionVocaPage = collectionVocaRepository.findCollectionVocaByUserId(userId, pageable);
        Page<CollectionVocabDTO> result = collectionVocaPage.map(collectionMapper::toDto);
        log.info("Lấy danh sách collection thành công: {} collection cho user ID: {}", result.getTotalElements(), userId);
        return result;
    }
}