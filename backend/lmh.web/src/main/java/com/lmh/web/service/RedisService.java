package com.lmh.web.service;

import java.util.Optional;

public interface RedisService {
    void deleteRefreshToken(Integer userId) ;
    Optional<String> getRefreshToken(Integer userId) ;
    void savedRefreshToken(Integer userId , String refreshToken) ;
}
