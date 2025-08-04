package com.lmh.web.repository;

import com.lmh.web.model.Language;
import com.lmh.web.model.Topic;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;


public interface LanguageRepository extends JpaRepository<Language, Integer>, JpaSpecificationExecutor<Language> {
    Optional<Language> findByName(String name);

    /**
     * Kiểm tra xem một ngôn ngữ có tồn tại dựa trên tên (không phân biệt chữ hoa, chữ thường).
     * @param name Tên ngôn ngữ cần kiểm tra.
     * @return true nếu tồn tại, ngược lại false.
     */
    boolean existsByNameIgnoreCase(String name);

    /**
     * Tìm một ngôn ngữ dựa trên tên (không phân biệt chữ hoa, chữ thường).
     * @param name Tên ngôn ngữ cần tìm.
     * @return Optional chứa Language nếu tìm thấy.
     */
    Optional<Language> findByNameIgnoreCase(String name);

}
