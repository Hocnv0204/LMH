package com.lmh.web.repository;

import com.lmh.web.model.CollectionVocab;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CollectionVocaRepository extends JpaRepository<CollectionVocab, Integer> {
} 