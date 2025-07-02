package com.lmh.web.repository;

import com.lmh.web.model.Topic;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


@Repository
public interface TopicRepository extends JpaRepository<Topic, String> {
    @Query("SELECT t FROM Topic t " +
            "WHERE t.level.name = :levelName AND t.language.name = :languageName AND t.deleteFlag = false " +
            "AND ((t.user.id = :userId AND t.type = :type) OR t.type = 'DEFAULT')")
    Page<Topic> findTopicsIncludingDefault(@Param("userId") Integer userId,
                                           @Param("levelName") String levelName,
                                           @Param("type") String type,
                                           @Param("languageName") String languageName,
                                           Pageable pageable);

}
