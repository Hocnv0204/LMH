package com.lmh.web.repository;

import com.lmh.web.common.constant.TypeToken;
import com.lmh.web.model.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.OptionalInt;

@Repository
public interface VerificationTokenRepository extends JpaRepository<VerificationToken , Integer> {
    Optional<VerificationToken> findByToken(String token) ;
    Optional<VerificationToken> findByUserIdAndTypeToken(Integer userId , TypeToken typeToken) ;
}
