package com.lmh.web.repository;

import com.lmh.web.model.CollectionVoca;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CollectionVocaRepository extends JpaRepository<CollectionVoca, Integer> {
   boolean existsByName(String name) ;
}