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
        log.info("Bắt đầu xóa refresh token cho user ID: {}", userId);
        try{
            String key = REFRESH_TOKEN_PREFIX + userId.toString() ;
            redisTemplate.delete(key) ;
            log.info("Xóa refresh token thành công cho user ID: {}", userId);
        }catch (Exception e){
            log.error("Xóa refresh token thất bại cho user ID: {}, lỗi: {}", userId, e.getMessage(), e);
        }
    }

    @Override
    public void savedRefreshToken(Integer userId , String refreshToken){
        log.info("Bắt đầu lưu refresh token cho user ID: {}", userId);
        try{
            String key = REFRESH_TOKEN_PREFIX + userId.toString() ;
            redisTemplate.opsForValue().set(key , refreshToken , REFRESH_TOKEN_DURATION);
            log.info("Lưu refresh token thành công cho user ID: {}", userId);
        }catch (Exception e){
            log.error("Lưu refresh token thất bại cho user ID: {}, lỗi: {}", userId, e.getMessage(), e);
        }
    }

    @Override
    public Optional<String> getRefreshToken(Integer userId){
        log.debug("Lấy refresh token cho user ID: {}", userId);
        try{
            String key = REFRESH_TOKEN_PREFIX + userId.toString() ;
            String value = redisTemplate.opsForValue().get(key).toString() ;
            if (value != null) {
                log.debug("Tìm thấy refresh token cho user ID: {}", userId);
            } else {
                log.debug("Không tìm thấy refresh token cho user ID: {}", userId);
            }
            return Optional.ofNullable(value) ;
        }catch (Exception e){
            log.error("Lấy refresh token thất bại cho user ID: {}, lỗi: {}", userId, e.getMessage(), e);
            return Optional.empty() ;
        }
    }
}

