package com.lmh.web.service.impl;

import com.lmh.web.repository.UserRepository;
import com.lmh.web.service.RedisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class RedisServiceImpl implements RedisService {
    private final static String REFRESH_TOKEN_PREFIX = "refreshToken:" ;
    private final static Duration REFRESH_TOKEN_DURATION = Duration.ofDays(7) ;


    private final RedisTemplate<String , String> redisTemplate ;
    @Override
    public void deleteRefreshToken(Integer userId){
        try{
            String key = REFRESH_TOKEN_PREFIX + userId.toString() ;
            redisTemplate.delete(key) ;
        }catch (Exception e){
            log.error("Error deleting refresh token : {}" , e.getMessage());
        }
    }

    @Override
    public void savedRefreshToken(Integer userId , String refreshToken){
        try{
            String key = REFRESH_TOKEN_PREFIX + userId.toString() ;
            redisTemplate.opsForValue().set(key , refreshToken , REFRESH_TOKEN_DURATION);
        }catch (Exception e){
            log.error("Error saving refresh token : {}" , e.getMessage());
        }
    }

    @Override
    public Optional<String> getRefreshToken(Integer userId){
        try{
            String key = REFRESH_TOKEN_PREFIX + userId.toString() ;
            String value = redisTemplate.opsForValue().get(key).toString() ;
            return Optional.ofNullable(value) ;
        }catch (Exception e){
            log.error("Error getting refresh token : {}" , e.getMessage());
            return Optional.empty() ;
        }
    }
}

