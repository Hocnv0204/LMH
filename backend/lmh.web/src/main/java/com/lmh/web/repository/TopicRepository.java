package com.lmh.web.repository;

import com.lmh.web.model.Topic;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TopicRepository extends JpaRepository<Topic, Integer>, JpaSpecificationExecutor<Topic> {

    @Query("SELECT t FROM Topic t " +
            "WHERE t.level.name = :levelName AND t.language.name = :languageName AND t.deleteFlag = false " +
            "AND ((t.user.id = :userId AND t.type = :type) OR t.type = 'DEFAULT')")
    Page<Topic> findTopicsIncludingDefault(@Param("userId") Integer userId,
                                           @Param("levelName") String levelName,
                                           @Param("type") String type,
                                           @Param("languageName") String languageName,
                                           Pageable pageable);

    boolean existsByName(String name);
    Optional<Topic> findByName(String name);

    /**
     * Find topic by ID and ensure it's not soft deleted
     */
    @Query("SELECT t FROM Topic t WHERE t.id = :id AND t.deleteFlag = false")
    Optional<Topic> findByIdAndNotDeleted(@Param("id") Integer id);

    /**
     * Find topic by ID for a specific user (either owned by user or DEFAULT type)
     */
    @Query("SELECT t FROM Topic t WHERE t.id = :id AND t.deleteFlag = false AND " +
            "(t.user.id = :userId OR t.type = 'DEFAULT')")
    Optional<Topic> findByIdForUser(@Param("id") Integer id, @Param("userId") Integer userId);
}
