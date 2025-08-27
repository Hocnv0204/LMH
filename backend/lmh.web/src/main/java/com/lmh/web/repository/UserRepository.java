package com.lmh.web.repository;


import com.lmh.web.dto.response.user.AdminUserSummaryResponse;
import com.lmh.web.model.CollectionVoca;
import com.lmh.web.model.Topic;
import com.lmh.web.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository  extends JpaRepository<User, Integer>, JpaSpecificationExecutor<User> {
    Optional<User> findByUsername(String username);

    boolean existsByUsernameIgnoreCase(String username);

    boolean existsByEmailIgnoreCase(String email);

    Optional<User> findByEmailIgnoreCase(String email);

    @Query("SELECT new com.lmh.web.dto.response.user.AdminUserSummaryResponse(" +
            "u.id, u.username, u.email, u.credit, u.createdAt, u.deleteFlag, " +
            "COUNT(DISTINCT t.id), COUNT(DISTINCT l.id)) " +
            "FROM User u " +
            "LEFT JOIN u.topics t " +
            "LEFT JOIN u.lessons l " +
            "WHERE (LOWER(u.name) LIKE :searchTerm " + // Đơn giản hóa
            "   OR LOWER(u.username) LIKE :searchTerm " + // Đơn giản hóa
            "   OR LOWER(u.email) LIKE :searchTerm) " + // Đơn giản hóa
            "AND (:role IS NULL OR LOWER(u.role) = :role) " + // Đơn giản hóa
            "AND (:isDeleted IS NULL OR u.deleteFlag = :isDeleted) " +
            "GROUP BY u.id, u.username, u.email, u.credit, u.createdAt, u.deleteFlag")
    Page<AdminUserSummaryResponse> findUserSummaries(
            @Param("searchTerm") String searchTerm, // Giờ đây là processedSearchTerm
            @Param("role") String role, // Giờ đây là processedRole
            @Param("isDeleted") Boolean isDeleted,
            Pageable pageable
    );

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.topics LEFT JOIN FETCH u.lessons WHERE u.id = :userId")
    Optional<User> findByIdWithDetails(@Param("userId") Integer userId);
    Page<User> findAll(Pageable pageable) ;
}

