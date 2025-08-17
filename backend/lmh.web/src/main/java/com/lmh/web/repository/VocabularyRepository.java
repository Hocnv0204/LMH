package com.lmh.web.repository;

import com.lmh.web.dto.VocabularyDTO;
import com.lmh.web.model.Vocabulary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VocabularyRepository extends JpaRepository<Vocabulary, Integer> {
    Page<Vocabulary> findByUserId(Integer userId , Pageable pageable);
   List<Vocabulary> findByCollectionId(Integer collectionId) ;
    // Optimized method for quiz with limit
    @Query("SELECT v FROM Vocabulary v WHERE v.collection.id = :collectionId ORDER BY function('random')")
    List<Vocabulary> findRandomByCollectionId(@Param("collectionId") Integer collectionId, Pageable pageable);
}

