package com.lmh.web.utils;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class RedisConnectionChecker {

    @Autowired
    private StringRedisTemplate redisTemplate;

    @PostConstruct
    public void checkConnection() {
        try {
            String pong = redisTemplate.getConnectionFactory()
                    .getConnection()
                    .ping();
            if ("PONG".equalsIgnoreCase(pong)) {
                log.info("✅ Redis connected successfully!");
            } else {
                log.info("⚠\uFE0F Redis ping returned: {}", pong);
            }
        } catch (Exception e) {
            log.info("❌ Redis connection failed: {}", e.getMessage());
        }
    }
}
