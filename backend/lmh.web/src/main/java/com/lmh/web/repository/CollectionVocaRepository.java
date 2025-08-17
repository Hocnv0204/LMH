package com.lmh.web.repository;

import com.lmh.web.model.CollectionVoca;
import com.lmh.web.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CollectionVocaRepository extends JpaRepository<CollectionVoca, Integer> {
   boolean existsByName(String name) ;
   Page<CollectionVoca> findCollectionVocaByUserId(Integer userId , Pageable pageable) ;
   Optional<CollectionVoca> findByIdAndUserId(Integer id , Integer userId) ;
   boolean existsByIdAndUserId(Integer id , Integer userId) ;
   boolean existsByNameAndUserId(String name , Integer userId) ;
 }